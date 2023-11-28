const params = JSON.parse(document.currentScript.dataset.params);

g_oSearchResults.m_cPageSize = params.numberOfListingsInt; g_oSearchResults.GoToPage(0, true);