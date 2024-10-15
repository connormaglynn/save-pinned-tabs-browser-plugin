export class TabsClient {
  constructor(browser) {
    this.browser = browser
  }

  /** @async @returns {Promise<Array<string>>} **/
  async getPinnedTabsOnCurrentWindow() {
    return await this.browser.tabs.query({ pinned: true, currentWindow: true })
  }

  /** @async @param {Array<string>} ids @returns {Promise<undefined>} **/
  async removePinnedTabsByIds(ids) {
    await this.browser.tabs.remove(ids)
  }

  /** @async @param {Array<string>} urls @returns {Promise<undefined>} **/
  async createPinnedTabs(urls) {
    urls.forEach(async (url) => {
      await this.browser.tabs.create({
        url: url,
        pinned: true,
      })
    })
  }
}
