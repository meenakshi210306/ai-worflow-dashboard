import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { createMultipleTasks } from "./task.service";

const workflowTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  priority: z.enum(["low", "medium", "high"]),
  owner: z.string().min(1),
  eta: z.string().min(1)
});

export const generatedWorkflowSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  tasks: z.array(workflowTaskSchema).min(3),
  checklist: z.array(z.string().min(1)).min(3),
  metrics: z.array(z.string().min(1)).min(2)
});

export type GeneratedWorkflow = z.infer<typeof generatedWorkflowSchema>;

export type WorkflowSuggestionRecord = {
  id: string;
  prompt: string;
  result: unknown;
  createdAt: Date;
};

export type CreateWorkflowInput = {
  userId: string;
  prompt: string;
  projectId?: string;
};

function titleFromPrompt(prompt: string) {
  const trimmed = prompt.trim();

  if (!trimmed) {
    return "Workflow Plan";
  }

  const firstPhrase = trimmed
    .replace(/["'`]/g, "")
    .replace(/\s+/g, " ")
    .split(/[,.;!?]/)[0]
    .slice(0, 60);

  return `${firstPhrase.charAt(0).toUpperCase()}${firstPhrase.slice(1)}`;
}

type ProjectContext = {
  name: string;
  description?: string | null;
};

function buildContextualPrompt(userPrompt: string, projectContext?: ProjectContext): string {
  if (!projectContext) {
    return userPrompt;
  }

  return `Project: ${projectContext.name}
${projectContext.description ? `Description: ${projectContext.description}` : ""}
Workflow Request: ${userPrompt}

Generate a workflow that is specific to this project's goals and context.`;
}

function createFallbackWorkflow(prompt: string): GeneratedWorkflow {
  const title = titleFromPrompt(prompt);
  const subject = title.toLowerCase();

  return {
    title,
    summary: `A startup-grade execution plan for ${subject}.`,
    tasks: [
      {
        title: "Research requirements",
        description: `Clarify goals, constraints, and success metrics for ${subject}.`,
        priority: "high",
        owner: "Product",
        eta: "Today"
      },
      {
        title: "Setup kickoff meeting",
        description: "Align the team on scope, owners, and delivery checkpoints.",
        priority: "high",
        owner: "Operations",
        eta: "Today"
      },
      {
        title: "Create roadmap",
        description: "Break the workflow into phases and define release milestones.",
        priority: "medium",
        owner: "Product",
        eta: "Tomorrow"
      },
      {
        title: "Assign frontend tasks",
        description: "Split UI work into reusable components, states, and pages.",
        priority: "medium",
        owner: "Frontend",
        eta: "Tomorrow"
      },
      {
        title: "Setup deployment pipeline",
        description: "Add validation, review gates, and production deployment steps.",
        priority: "high",
        owner: "Engineering",
        eta: "This week"
      }
    ],
    checklist: [
      "Confirm workflow owner",
      "Review dependencies",
      "Approve first milestone"
    ],
    metrics: [
      "5 execution steps generated",
      "1 delivery plan ready for review"
    ]
  };
}

async function requestOpenAIWorkflow(prompt: string, projectContext?: ProjectContext): Promise<GeneratedWorkflow> {
  const apiKey = process.env.OPENAI_API_KEY;
  const contextualPrompt = buildContextualPrompt(prompt, projectContext);

  if (!apiKey) {
    return createFallbackWorkflow(contextualPrompt);
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are an expert startup operations planner. Return only valid JSON that matches this shape: { title, summary, tasks: [{ title, description, priority: 'low'|'medium'|'high', owner, eta }], checklist: string[], metrics: string[] }. Make the workflow concrete, business-ready, and concise. Tailor the workflow to the specific project context provided."
        },
        {
          role: "user",
          content: contextualPrompt
        }
      ]
    })
  });

  if (!response.ok) {
    return createFallbackWorkflow(contextualPrompt);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string | null } }>;
  };
  const content = payload.choices?.[0]?.message?.content;

  if (!content) {
    return createFallbackWorkflow(contextualPrompt);
  }

  try {
    const parsed = JSON.parse(content);
    return generatedWorkflowSchema.parse(parsed);
  } catch {
    return createFallbackWorkflow(contextualPrompt);
  }
}

export async function createWorkflowSuggestion(input: CreateWorkflowInput) {
  const project = await prisma.$transaction(async (database) => {
    let foundProject = null;

    if (input.projectId) {
      foundProject = await database.project.findUnique({
        where: { id: input.projectId }
      });
    }

    if (!foundProject) {
      foundProject = await database.project.findFirst({
        where: { ownerId: input.userId },
        orderBy: { createdAt: "desc" }
      });
    }

    if (!foundProject) {
      foundProject = await database.project.create({
        data: {
          name: "My Project",
          description: "Project for workflow tasks",
          ownerId: input.userId
        }
      });
    }

    return foundProject;
  });

  const projectContext: ProjectContext = {
    name: project.name,
    description: project.description
  };
  const workflow = await requestOpenAIWorkflow(input.prompt, projectContext);
  const result = workflow as unknown;

  const suggestion = await prisma.$transaction(async (database) => {
    const createdSuggestion = await database.workflowSuggestion.create({
      data: {
        prompt: input.prompt,
        result: result as Prisma.InputJsonValue,
        userId: input.userId,
        projectId: project.id
      }
    });

    await Promise.all(
      workflow.tasks.map((task) =>
        database.task.create({
          data: {
            title: task.title,
            description: task.description,
            priority: task.priority.toUpperCase() as "LOW" | "MEDIUM" | "HIGH" | "URGENT",
            projectId: project.id,
            createdById: input.userId,
            assigneeId: null
          }
        })
      )
    );

    await database.activityLog.create({
      data: {
        action: "workflow.generated",
        entityType: "WorkflowSuggestion",
        entityId: createdSuggestion.id,
        metadata: {
          prompt: input.prompt,
          title: workflow.title,
          taskCount: workflow.tasks.length,
          projectName: project.name
        } as unknown as Prisma.InputJsonValue,
        userId: input.userId,
        projectId: project.id
      }
    });

    await database.notification.create({
      data: {
        userId: input.userId,
        type: "workflow.generated",
        title: `${workflow.title} generated for ${project.name}`,
        message: `Generated ${workflow.tasks.length} workflow steps from your prompt for project "${project.name}".`,
        actionUrl: "/dashboard/ai-suggestions",
        metadata: {
          suggestionId: createdSuggestion.id,
          prompt: input.prompt,
          projectName: project.name
        } as unknown as Prisma.InputJsonValue
      }
    });

    return createdSuggestion;
  });

  return {
    suggestion,
    workflow
  };
}

export async function listWorkflowSuggestions(userId: string) {
  const suggestions = await prisma.workflowSuggestion.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 10
  });

  return suggestions.map((suggestion) => ({
    ...suggestion,
    result: generatedWorkflowSchema.parse(suggestion.result)
  }));
}