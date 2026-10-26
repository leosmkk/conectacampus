export async function publishEvents(repository, queue) {
  let count = 0;
  for (const event of await repository.pending()) {
    await queue.sendMessage(Buffer.from(event.payload).toString('base64'));
    await repository.published(event.id);
    count++;
  }
  return count;
}
