-- CreateTable
CREATE TABLE "CourseAssessment" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "weight" INTEGER NOT NULL,
    "maxScore" INTEGER NOT NULL DEFAULT 100,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CourseAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnrollmentAssessmentScore" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "score" DOUBLE PRECISION,
    "maxScore" DOUBLE PRECISION,

    CONSTRAINT "EnrollmentAssessmentScore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CourseAssessment_courseId_idx" ON "CourseAssessment"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseAssessment_courseId_name_key" ON "CourseAssessment"("courseId", "name");

-- CreateIndex
CREATE INDEX "EnrollmentAssessmentScore_enrollmentId_idx" ON "EnrollmentAssessmentScore"("enrollmentId");

-- CreateIndex
CREATE UNIQUE INDEX "EnrollmentAssessmentScore_enrollmentId_assessmentId_key" ON "EnrollmentAssessmentScore"("enrollmentId", "assessmentId");

-- AddForeignKey
ALTER TABLE "CourseAssessment" ADD CONSTRAINT "CourseAssessment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnrollmentAssessmentScore" ADD CONSTRAINT "EnrollmentAssessmentScore_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnrollmentAssessmentScore" ADD CONSTRAINT "EnrollmentAssessmentScore_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "CourseAssessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
