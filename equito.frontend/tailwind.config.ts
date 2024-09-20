import withMT from "@material-tailwind/react/utils/withMT";

export default withMT({
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#1C1F2B",
        foreground: "#E5E5E5",
        "card-background": "#272B35",
        "card-foreground": "#A0A4B8",
        primary: "#4A90E2",
        secondary: "#8A939F",
        focused: "#5AA5F2",
        success: "#3ED598",
        error: "#FF4D4F",
      },
      backgroundImage: {
        "app-name-gradient":
          "linear-gradient(90deg, hsla(210, 84%, 34%, 1) 0%, hsla(204, 67%, 43%, 1) 32%, hsla(166, 90%, 36%, 1) 62%, hsla(149, 48%, 47%, 1) 100%)",
      },
    },
  },
  plugins: [],
});
