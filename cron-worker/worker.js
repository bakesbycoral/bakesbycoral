export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(triggerReminders(env));
  },

  async fetch(request, env) {
    // Allow manual trigger via HTTP for testing
    const url = new URL(request.url);
    if (url.pathname === '/trigger') {
      const result = await triggerReminders(env);
      return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response('Bakes by Coral Cron Worker', { status: 200 });
  },
};

async function triggerReminders(env) {
  try {
    const response = await fetch('https://bakesbycoral.com/api/cron/reminders', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${env.CRON_SECRET}`,
      },
    });

    const data = await response.json();
    console.log('Reminder cron result:', JSON.stringify(data));
    return data;
  } catch (error) {
    console.error('Reminder cron failed:', error);
    return { error: error.message };
  }
}
