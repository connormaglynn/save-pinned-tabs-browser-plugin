import { TabsClient } from "../clients/tabsClient.js"
import { GroupEntity } from "../repositories/groupRepository.js"

export class TabsService {
  /** @param {TabsClient} tabsClient  **/
  constructor(tabsClient) {
    this.tabsClient = tabsClient
  }

  /** @async @param {GroupEntity} group **/
  async replacePinnedTabsOnCurrentWindow(group) {
    const oldPinnedTabs = await this.tabsClient.getPinnedTabsOnCurrentWindow()
    const oldPinnedTabsIds = oldPinnedTabs.map((tab) => tab.id)
    const newPinnedTabsUrls = group?.pinnedTabsUrls
    await this.tabsClient.createPinnedTabs(newPinnedTabsUrls)
    await this.tabsClient.removePinnedTabsByIds(oldPinnedTabsIds)
  }

  /** @async @param url @returns Promise<Array<string>>> **/
  async getPinnedTabsOnCurrentWindow() {
    return await this.tabsClient.getPinnedTabsOnCurrentWindow()
  }

}
