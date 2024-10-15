export class PreferencesModel {
  /** @param {string} groupIdToLoadOnStartup **/
  constructor(groupIdToLoadOnStartup) {
    this.groupIdToLoadOnStartup = groupIdToLoadOnStartup
  }
}

export class PreferencesRepository {
  constructor(browser) {
    this.key = "preferences"
    this.browser = browser
  }

  /** @async @param {PreferencesModel} updatedGroup @returns {Promise<undefined>} **/
  async update(preferences) {
    console.info(`ℹ️  PreferencesRepository.update(${JSON.stringify(preferences)}) called`)
    await this.browser.storage.sync.set({ [this.key]: preferences })
  }

  /** @async @returns {Promise<PreferencesModel>} **/
  async get() {
    console.info(`ℹ️  PreferencesRepository.get() called`)
    const { preferences } = await this.browser.storage.sync.get(this.key)
    return new PreferencesModel(preferences?.groupIdToLoadOnStartup)
  }
}
