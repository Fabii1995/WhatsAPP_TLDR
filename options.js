const $ = (id) => document.getElementById(id);

chrome.storage.local.get(["apiKey", "provider", "geminiModel", "enabled", "minLines", "minChars"], (s) => {
  $("apiKey").value = s.apiKey || "";
  $("provider").value = s.provider || "gemini";
  $("geminiModel").value = s.geminiModel || "";
  $("enabled").checked = s.enabled !== false;
  $("minLines").value = s.minLines || 12;
  $("minChars").value = s.minChars || 150;
});

$("save").addEventListener("click", () => {
  chrome.storage.local.set(
    {
      apiKey: $("apiKey").value.trim(),
      provider: $("provider").value,
      geminiModel: $("geminiModel").value.trim(),
      enabled: $("enabled").checked,
      minLines: Math.max(1, Number($("minLines").value) || 12),
      minChars: Math.max(1, Number($("minChars").value) || 150),
    },
    () => {
      $("status").textContent = "Saved";
      setTimeout(() => ($("status").textContent = ""), 1500);
    }
  );
});
