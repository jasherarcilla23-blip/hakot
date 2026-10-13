import express from "express";
import path from "path";
import askRouter from "./routes/ask";

const app = express();
app.use(express.json({ limit: "10kb" }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/", askRouter);

app.use((err: any, req: any, res: any, next: any) => {
 if (err instanceof SyntaxError) {
 res.status(400).json({ error: "Malformed JSON" });
 } else {
 res.status(500).json({ error: "Internal server error" });
 }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
 console.log(`Server is running on port ${port}`);
});
