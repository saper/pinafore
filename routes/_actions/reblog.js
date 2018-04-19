import { store } from '../_store/store'
import { toast } from '../_utils/toast'
import { reblogStatus, unreblogStatus } from '../_api/reblog'
import { setStatusReblogged as setStatusRebloggedInDatabase } from '../_database/timelines/updateStatus'

export async function setReblogged (statusId, reblogged) {
  if (!store.get('online')) {
    toast.say(`You cannot ${reblogged ? 'boost' : 'unboost'} while offline.`)
    return
  }
  let currentInstance = store.get('currentInstance')
  let accessToken = store.get('accessToken')
  let networkPromise = reblogged
    ? reblogStatus(currentInstance, accessToken, statusId)
    : unreblogStatus(currentInstance, accessToken, statusId)
  store.setStatusReblogged(currentInstance, statusId, reblogged) // optimistic update
  try {
    await networkPromise
    await setStatusRebloggedInDatabase(currentInstance, statusId, reblogged)
  } catch (e) {
    console.error(e)
    toast.say(`Failed to ${reblogged ? 'boost' : 'unboost'}. ` + (e.message || ''))
    store.setStatusReblogged(currentInstance, statusId, !reblogged) // undo optimistic update
  }
}
