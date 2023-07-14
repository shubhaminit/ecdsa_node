const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
  "02bdc8c7430ae94694c2f4429612817bd6fff90e1b85d4c66f974f44b71348218c": 100,  // Sam
  "035b6629f647039b0660bedc4c1579af3fc399771b71bd89c3b34ffeacb457f277": 50,   // Bane
  "0303f444f1aa1e715f7e4b9a0044b9834ee209adb714775c3d619f74d5c7386927": 75,   // Shane
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { sender, recipient, amount } = req.body;

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
