/*
  Warnings:

  - Made the column `userId` on table `WorkflowSuggestion` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "WorkflowSuggestion" ALTER COLUMN "userId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "WorkflowSuggestion" ADD CONSTRAINT "WorkflowSuggestion_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowSuggestion" ADD CONSTRAINT "WorkflowSuggestion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
