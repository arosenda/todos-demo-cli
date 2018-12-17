import {guid, ID} from '@datorama/akita';

export interface Todo {
  id: ID;
  title: string;
  completed: boolean;
}

export function createTodo({title}: Partial<Todo>) {
  return {
    id: guid(),
    title,
    completed: false
  } as Todo;
}
