const express = require("express");
const app = express();
const http = require("http");
const morgan = require("morgan");
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

const OpenAI = require('openai')

const openai = new OpenAI({ apiKey: process.env.API });

require("dotenv").config();

app.use(morgan("tiny"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.get("/", (req, res) => res.json({success : true, message : "Deployed!"}))

app.post("/askai", async (req, res) => {

  const assistant = await openai.beta.assistants.create({
    name: "Therapeia",
    instructions: "You are mental therapist, say sorry to every questions which is not related to mind",
    model: "gpt-4o"
  });

  const thread = await openai.beta.threads.create();

  const message = await openai.beta.threads.messages.create(
    thread.id,
    {
      role: "user",
      content: req?.body?.question
    }
  );

  let run = await openai.beta.threads.runs.createAndPoll(
    thread.id,
    { 
      assistant_id: assistant.id,
      instructions: "You are mental therapist, say sorry to every questions which is not related to mind"
    }
  );

  if (run.status === 'completed') {

    const messages = await openai.beta.threads.messages.list(
      run.thread_id
    );

    // console.log(JSON.stringify())

    return res.json({success : true, message : messages.data[0]?.content[0]?.text?.value})
    


    // for (const message of messages.data.reverse()) {
    //   console.log(`${message.role} > ${message.content[0].text.value}`);
    // }

  } else {

    console.log(run.status);

  }

    return res.json({success : true, message : "hello there this is me atul tiwaree"})

});



server.listen(PORT, (err) =>
  !err ? console.log(`✔ Node Listening to http://localhost:${PORT}`) : console.log("There was some error ", err.message)
);
