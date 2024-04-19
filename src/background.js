chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.action === "savePinnedTabs") {
    const pinnedTabs = await chrome.tabs.query({ pinned: true })
    const pinnedTabURLs = pinnedTabs.map((tab) => tab.url)
    await chrome.storage.sync.set({ pinnedTabs: pinnedTabURLs })
    console.log(`Pinned tabs saved successfully: [ ${Array.toString(pinnedTabURLs)} ]`)
  }
})
