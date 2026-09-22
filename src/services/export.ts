import { Trip } from '../types';

export function exportTripToMarkdown(trip: Trip): string {
  let md = `# 🗺️ ${trip.title}\n\n`;
  md += `*Exported from VibeTrip (CRDT Co-op Itinerary Planner)*\n\n`;
  md += `---\n\n`;

  trip.days.forEach((day) => {
    md += `## 📅 Day ${day.dayNumber}: ${day.title || day.date} (${day.date})\n\n`;
    md += `- **Origin:** ${day.origin.name} (${day.origin.lat.toFixed(4)}, ${day.origin.lng.toFixed(4)})\n`;
    if (day.tags.length > 0) {
      md += `- **Tags:** ${day.tags.map((t) => `\`#${t}\``).join(' ')}\n`;
    }
    if (day.notes) {
      md += `\n### 📝 Day Plan\n> ${day.notes.replace(/\n/g, '\n> ')}\n\n`;
    }

    md += `### 📍 Waypoints & Route\n\n`;
    if (day.waypoints.length === 0) {
      md += `*No waypoints scheduled.*\n\n`;
    } else {
      day.waypoints.forEach((wp, idx) => {
        md += `${idx + 1}. **${wp.name}** [${wp.travelMode.toUpperCase()}]\n`;
        if (wp.notes) md += `   - *Notes:* ${wp.notes}\n`;
        if (wp.estimatedDuration) md += `   - *Duration:* ${wp.estimatedDuration}\n`;
        md += `   - *Coords:* [${wp.lat.toFixed(5)}, ${wp.lng.toFixed(5)}]\n`;
      });
      md += `\n`;
    }

    md += `---\n\n`;
  });

  return md;
}

export function downloadFile(content: string, filename: string, type: string = 'text/plain') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
