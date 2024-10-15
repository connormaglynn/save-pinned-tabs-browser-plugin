export class PreferencesModel {
  /** @param {string} loadOnStartup **/
  constructor(loadOnStartup) {
    this.loadOnStartup = loadOnStartup
  }
}

export class PreferencesRepository {
  constructor(browser) {
    this.key = "preferences"
    this.browser = browser
  }

  /** @async @param {PreferencesModel} updatedGroup @returns {Promise<undefined>} **/
  async update(preferences) {
    console.info(`ℹ️  PreferencesRepository.update(${preferences.loadOnStartup}) called`)
    await this.browser.storage.sync.set({ [this.key]: preferences })
  }

  /** @async @returns {Promise<PreferencesModel>} **/
  async get() {
    console.info(`ℹ️  PreferencesRepository.get() called`)
    const { preferences } = await this.browser.storage.sync.get(this.key)
    return new PreferencesModel(preferences?.loadOnStartup)
  }
}
