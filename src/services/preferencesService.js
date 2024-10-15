import { PreferencesModel, PreferencesRepository } from "../repositories/preferencesRepository.js"

export class PreferencesService {
  /** @param {PreferencesRepository} preferencesRepository  **/
  constructor(preferencesRepository) {
    this.preferencesRepository = preferencesRepository
  }

  /** @async @param {PreferencesModel} updatedGroup @returns {Promise<undefined>} **/
  async update(preferences) {
    return await this.preferencesRepository.update(preferences)
  }

  /** @async @returns {Promise<PreferencesModel>} **/
  async get() {
    return await this.preferencesRepository.get()
  }
}

