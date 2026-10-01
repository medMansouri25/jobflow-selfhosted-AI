-- CreateTable
CREATE TABLE "Profile" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "fullName" VARCHAR(200),
    "targetRole" VARCHAR(200),
    "location" VARCHAR(200),
    "email" VARCHAR(200),
    "phone" VARCHAR(40),
    "linkedinUrl" VARCHAR(2048),
    "about" TEXT,
    "experience" TEXT,
    "projects" TEXT,
    "skills" TEXT,
    "education" TEXT,
    "writingSamples" TEXT,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
