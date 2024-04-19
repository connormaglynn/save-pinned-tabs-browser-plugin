chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === "savePinnedTabs") {
    savePinnedTabs()
    sendResponse({ message: "Pinned tabs saved" })
  }
})

function savePinnedTabs() {
  chrome.tabs.query({ pinned: true }, function (pinnedTabs) {
    var pinnedTabURLs = pinnedTabs.map((tab) => tab.url)
    chrome.storage.sync.set({ pinnedTabs: pinnedTabURLs }, function () {
      console.log(pinnedTabURLs)
      console.log("Pinned tabs saved successfully")
    })
  })
}
