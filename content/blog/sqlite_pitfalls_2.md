---
title: "Sqlite Pitfalls 2"
date: 2025-06-29T00:00:00+00:00
tags: ["SQL", "SQLite"]
draft: false
---

Exploration into the critical subsystems of SQLite that are frequently overlooked during initial implementation. We will examine the nuances of referential integrity enforcement, the mechanics of Write-Ahead Logging (WAL) for concurrent access, and the strategies for managing disk footprint through vacuuming.

This is continuation of [discussion about SQLite pitfalls.](https://mszalewicz.github.io/blog/sqlite_pitfalls_1/)

<!--more-->

## Enabling Foreign Key Constraints

Foreign key constraints are disabled by default in SQLite. This design choice is primarily historical, aimed at preventing backward compatibility issues with older database files and allowing flexibility when importing data that may be temporarily inconsistent. To enforce referential integrity, the application must turn this feature on explicitly using **PRAGMA foreign_keys = ON**. Crucially, this setting is not stored in the database file metadata; it is a connection-specific flag. Therefore, every new database connection established by your application must issue this pragma immediately upon connecting if enforcement is desired.

Once enabled, SQLite enforces the constraints immediately, rejecting any INSERT, UPDATE, or DELETE operations that would violate the defined relationships. However, enabling the pragma does not retroactively validate existing data in the database. If the database already contains orphaned records or mismatched keys, the pragma will not report errors until you attempt to modify those specific rows. To validate the integrity of an existing dataset, one must manually run the **PRAGMA foreign_key_check** command, which scans the specified tables and returns any rows that currently violate foreign key definitions.

## Handling SQLITE_BUSY and SQL_LOCKED Errors

The distinction between **SQLITE_BUSY** and **SQLITE_LOCKED** is critical for debugging, as they refer to locking conflicts in different scopes. SQLITE_BUSY occurs when a database connection attempts to acquire a lock on the database file, but the file is already locked by a different database connection (potentially in a separate process). This is common in high-concurrency scenarios without Write-Ahead Logging (WAL). To mitigate this, developers should use **PRAGMA busy_timeout = milliseconds** to instruct the SQLite library to sleep and retry the operation for a defined period before giving up, rather than implementing their own retry loops in the application layer.

Conversely, SQLITE_LOCKED indicates a conflict within the same database connection. This typically happens when a developer attempts to write to a table while a SELECT statement on that same table is still active (i.e., sqlite3_step() has been called, but sqlite3_finalize() or sqlite3_reset() has not). Because the read cursor holds a shared lock, the write operation on the same connection cannot proceed. Unlike SQLITE_BUSY, there is no timeout handler for this error; the solution requires strictly managing statement lifecycles to ensure read operations are finalized before write operations begin on the same handle.

## Managing Large-Scale Deletions

When rows are deleted from an SQLite database, the file system size of the database file does not immediately decrease. Instead, SQLite marks the pages where the data resided as "free pages" and adds them to a freelist stored within the database header. This is a performance optimization: it is faster to overwrite these free pages during subsequent INSERT operations than to constantly resize the file on disk. Consequently, a database that undergoes heavy deletion will appear significantly larger on disk than the raw data it contains.

To physically reclaim this space and return it to the operating system, the **VACUUM** command must be executed. This command works by copying the entire database content into a temporary file—repacking it with no free pages—and then moving it back over the original file. Alternatively, if the database is configured with **PRAGMA auto_vacuum = INCREMENTAL**, the application can remove a specific number of pages from the freelist. This approach allows for gradual space reclamation without the blocking I/O overhead of a full database rebuild.

## NUL Characters in Text

SQLite is technically "binary safe" regarding the NUL character (0x00) in text fields, meaning it does not treat NUL as a rigid string terminator in storage. A TEXT column can validly contain a string like 'Hello\0World', and SQLite will store the full byte sequence, effectively differentiating it from a BLOB only by the encoding associated with the column. This capability allows for the storage of distinct data types that other SQL engines might reject or truncate.

However, the complexity arises when interfacing with the C-API. If you use standard C-string functions or sqlite3_bind_text passing a negative length (indicating "calculate length until NUL"), SQLite will truncate the input at the first NUL character. To successfully store and retrieve text containing NULs, the application must explicitly provide the byte length of the string to sqlite3_bind_text (or bind_text64) and rely on sqlite3_column_bytes rather than just sqlite3_column_text when reading data, ensuring the application reads past the NUL character in the return buffer.

## Using WAL (Write-Ahead Logging)

Write-Ahead Logging (WAL) is a journaling mode enabled via **PRAGMA journal_mode=WAL** that significantly alters how SQLite handles atomicity and concurrency. In default rollback modes, a write operation requires an exclusive lock that prevents all other readers and writers from accessing the database. WAL improves this by appending changes to a separate -wal file rather than writing directly to the main database file. This architecture allows readers to read from the main database (and the WAL) while a writer appends to the WAL, effectively allowing simultaneous readers and writers.

The changes stored in the -wal file are eventually transferred to the main database file in an operation called a "checkpoint." Unlike foreign key settings, the WAL journaling mode is persistent; once set, the database remains in WAL mode across connections and restarts until explicitly changed. However, WAL introduces operational constraints: it relies on a shared memory file (-shm), which means all connections to the database must be on the same machine (preventing use over most network filesystems), and the -wal file can grow indefinitely if checkpoints are not triggered regularly.