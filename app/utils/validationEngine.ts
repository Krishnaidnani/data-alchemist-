/* eslint-disable @typescript-eslint/no-explicit-any */
export type ValidationError = {
  entity: 'clients' | 'tasks' | 'workers';
  rowIndex: number;
  column: string;
  message: string;
};

export function validateAll(
  clients: any[],
  tasks: any[],
  workers: any[]
): ValidationError[] {
  const errors: ValidationError[] = [];

  const taskIDs = new Set(tasks.map((t) => t.TaskID));
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const workerIDs = new Set(workers.map((w) => w.WorkerID));
  const allSkills = new Set(
    workers.flatMap(
      (w) => w.Skills?.split(',').map((s: string) => s.trim()) || []
    )
  );


  function err(
    entity: 'clients' | 'tasks' | 'workers',
    rowIndex: number,
    column: string,
    message: string
  ): ValidationError {
    return { entity, rowIndex, column, message };
  }

  function checkRequiredColumns(
    entityName: string,
    row: any,
    idx: number,
    requiredCols: string[]
  ) {
    for (const col of requiredCols) {
      if (!(col in row)) {
        errors.push(
          err(entityName as any, idx, col, 'Missing required column')
        );
      }
    }
  }

 
  const seenClientIDs = new Set();
  clients.forEach((client, idx) => {
    checkRequiredColumns('clients', client, idx, [
      'ClientID',
      'ClientName',
      'PriorityLevel',
      'RequestedTaskIDs',
      'AttributesJSON',
    ]);

    if (client.ClientID) {
      if (seenClientIDs.has(client.ClientID))
        errors.push(err('clients', idx, 'ClientID', 'Duplicate ClientID'));
      seenClientIDs.add(client.ClientID);
    }

    if (!(+client.PriorityLevel >= 1 && +client.PriorityLevel <= 5)) {
      errors.push(
        err('clients', idx, 'PriorityLevel', 'PriorityLevel must be 1-5')
      );
    }

    try {
      JSON.parse(client.AttributesJSON);
    } catch {
      errors.push(err('clients', idx, 'AttributesJSON', 'Invalid JSON'));
    }

    client.RequestedTaskIDs?.split(',').forEach((id: string) => {
      const cleanId = id.trim();
      if (!taskIDs.has(cleanId)) {
        errors.push(
          err('clients', idx, 'RequestedTaskIDs', `Unknown TaskID: ${cleanId}`)
        );
      }
    });
  });


  const seenTaskIDs = new Set();
  tasks.forEach((task, idx) => {
    checkRequiredColumns('tasks', task, idx, [
      'TaskID',
      'TaskName',
      'Duration',
      'RequiredSkills',
      'PreferredPhases',
    ]);

    if (task.TaskID) {
      if (seenTaskIDs.has(task.TaskID))
        errors.push(err('tasks', idx, 'TaskID', 'Duplicate TaskID'));
      seenTaskIDs.add(task.TaskID);
    }

    if (+task.Duration < 1)
      errors.push(err('tasks', idx, 'Duration', 'Duration must be >= 1'));

    task.RequiredSkills?.split(',').forEach((skill: string) => {
      const cleanSkill = skill.trim();
      if (!allSkills.has(cleanSkill)) {
        errors.push(
          err(
            'tasks',
            idx,
            'RequiredSkills',
            `No worker with skill: ${cleanSkill}`
          )
        );
      }
    });

    const phases = normalizePhases(task.PreferredPhases);
    if (!Array.isArray(phases)) {
      errors.push(
        err('tasks', idx, 'PreferredPhases', 'Malformed PreferredPhases')
      );
    }
  });


  const seenWorkerIDs = new Set();
  workers.forEach((worker, idx) => {
    checkRequiredColumns('workers', worker, idx, [
      'WorkerID',
      'Skills',
      'AvailableSlots',
      'MaxLoadPerPhase',
    ]);

    if (worker.WorkerID) {
      if (seenWorkerIDs.has(worker.WorkerID))
        errors.push(err('workers', idx, 'WorkerID', 'Duplicate WorkerID'));
      seenWorkerIDs.add(worker.WorkerID);
    }

    try {
      const slots = JSON.parse(worker.AvailableSlots);
      if (!Array.isArray(slots) || slots.some((s) => isNaN(s))) {
        throw new Error();
      }
    } catch {
      errors.push(err('workers', idx, 'AvailableSlots', 'Malformed list'));
    }

    if (isNaN(+worker.MaxLoadPerPhase)) {
      errors.push(err('workers', idx, 'MaxLoadPerPhase', 'Must be a number'));
    } else {
      try {
        const slots = JSON.parse(worker.AvailableSlots);
        if (slots.length < +worker.MaxLoadPerPhase) {
          errors.push(
            err(
              'workers',
              idx,
              'MaxLoadPerPhase',
              'Worker overloaded: not enough slots'
            )
          );
        }
      } catch {}
    }
  });

  return errors;
}

function normalizePhases(value: string): number[] | null {
  try {
    if (value.startsWith('[')) return JSON.parse(value);
    if (value.includes('-')) {
      const [start, end] = value.split('-').map(Number);
      return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    }
    return value.split(',').map(Number);
  } catch {
    return null;
  }
}
