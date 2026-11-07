IF OBJECT_ID('dbo.Certificates', 'U') IS NULL
CREATE TABLE dbo.Certificates (
  id uniqueidentifier NOT NULL PRIMARY KEY,
  title nvarchar(200) NOT NULL,
  student nvarchar(200) NOT NULL,
  completedAt char(10) NOT NULL,
  hours int NOT NULL CHECK (hours BETWEEN 1 AND 1000),
  status varchar(20) NOT NULL CHECK (status IN ('disponivel', 'emitido'))
)
IF OBJECT_ID('dbo.Outbox', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.Outbox (
    id uniqueidentifier NOT NULL PRIMARY KEY,
    payload nvarchar(max) NOT NULL,
    createdAt datetime2 NOT NULL DEFAULT SYSUTCDATETIME(),
    publishedAt datetime2 NULL
  )
  CREATE INDEX IX_Outbox_Pending ON dbo.Outbox(publishedAt, createdAt)
END
