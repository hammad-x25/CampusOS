// Small helpers shared by the advanced CampusOS features.
(function (campus) {
  function formatTimeMinutes(minutes) {
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;

    return `${String(displayHour).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${suffix}`;
  }

  function formatDuration(minutes) {
    const safeMinutes = Math.max(0, Math.round(minutes));
    const hours = Math.floor(safeMinutes / 60);
    const remainingMinutes = safeMinutes % 60;

    if (!hours) {
      return `${remainingMinutes}m`;
    }

    return `${hours}h ${String(remainingMinutes).padStart(2, '0')}m`;
  }

  function formatCountdown(milliseconds) {
    const totalMinutes = Math.max(0, Math.floor(milliseconds / 60000));
    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const minutes = totalMinutes % 60;

    if (days > 0) {
      return `${days}d ${hours}h remaining`;
    }

    return `${hours}h ${String(minutes).padStart(2, '0')}m remaining`;
  }

  function getLocalDateKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  function formatLastSave(timestamp) {
    if (!timestamp) {
      return 'Not saved yet';
    }

    return new Date(timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function markLocalSave() {
    const timestamp = new Date().toISOString();
    localStorage.setItem(campus.storageKeys.lastLocalSave, timestamp);
    document.dispatchEvent(new CustomEvent('campus:local-save', { detail: { timestamp } }));
  }

  function ensureLocalSaveTimestamp() {
    const timestamp = localStorage.getItem(campus.storageKeys.lastLocalSave);

    if (!timestamp) {
      markLocalSave();
    }

    return localStorage.getItem(campus.storageKeys.lastLocalSave);
  }

  campus.utils = {
    formatTimeMinutes,
    formatDuration,
    formatCountdown,
    getLocalDateKey,
    formatLastSave,
    escapeHtml,
    markLocalSave,
    ensureLocalSaveTimestamp
  };
})(window.CampusOS || (window.CampusOS = {}));
