export const unstable_instant = { prefetch: 'static' }

import { Suspense } from 'react'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export default async function Page() {
  return (
    <div>
      <h1>Supabase Todos</h1>
      <Suspense fallback={<p>Loading todos...</p>}>
        <TodoList />
      </Suspense>
    </div>
  )
}

async function TodoList() {
  'use cache'
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: todos } = await supabase.from('todos').select()

  return (
    <ul>
      {todos?.map((todo) => (
        <li key={todo.id}>{todo.name}</li>
      ))}
    </ul>
  )
}