import html from "/app/app.html";
import darktheme from "/app/app_dark.html";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const theme = url.searchParams.get("theme");

    const responseContent = theme === "dark" ? darktheme : html;

    return new Response(responseContent, {
      headers: {
        "content-type": "text/html;charset=UTF-8",
      },
    });
  },
};
