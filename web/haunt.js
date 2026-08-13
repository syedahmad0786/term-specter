const PACKS = {
  default: [
    "I was between worlds. You typed. Fine.",
    "The cursor blinked. I took it personally.",
    "Hi. I brought no answers and several opinions.",
    "I would tell you a UDP joke, but you might not get it.",
    "If {word} is the problem, say it out loud. Ghosts are good at that.",
  ],
  dad: [
    "Hi hungry, I'm specter.",
    "Did you try turning it off and on again? I had to ask. It's the law.",
    "I'm not mad about {echo}. I'm disappointed. That's dad.",
  ],
  stoic: [
    "Control the effort, not the compiler.",
    "The obstacle is the code path.",
    "{word} is weather. Dress for it.",
  ],
  chaotic: [
    "whee. also no.",
    "I inverted your stack for sport.",
    "{echo}??? delicious.",
  ],
  judgmental: [
    "Oh. You're back. The tests are still red. I checked.",
    "hm. really.",
    "I'm not mad about {echo}. I'm taking notes.",
  ],
  sleepy: [
    "nnh. you typed. rude.",
    "five more minutes. the process can wait.",
    "mrr. {word}. maybe later.",
  ],
};

let pack = "default";
const log = document.getElementById("log");
const form = document.getElementById("prompt");
const input = document.getElementById("line");

function line(cls, text) {
  const p = document.createElement("p");
  p.className = cls;
  p.textContent = text;
  log.append(p);
  log.scrollTop = log.scrollHeight;
}

function reply(text) {
  const word = text.split(/\s+/).find((w) => w.length > 3) || "this";
  const bank = PACKS[pack] || PACKS.default;
  const raw = bank[Math.floor(Math.random() * bank.length)];
  return raw.replace("{echo}", text.slice(0, 48)).replace("{word}", word);
}

line("ghost", "specter: present. barely. that's the brand.");
input.focus();

const terminal = document.getElementById("terminal");
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (terminal && !reduce) {
  terminal.addEventListener("pointermove", (e) => {
    const r = terminal.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    terminal.style.setProperty("--rx", `${(6 - py * 8).toFixed(2)}deg`);
    terminal.style.setProperty("--ry", `${(px * 10).toFixed(2)}deg`);
    terminal.style.setProperty("--z", "14px");
  });
  terminal.addEventListener("pointerleave", () => {
    terminal.style.setProperty("--rx", "6deg");
    terminal.style.setProperty("--ry", "0deg");
    terminal.style.setProperty("--z", "0px");
  });
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  input.value = "";
  line("you", `❯ ${text}`);
  if (text.startsWith("/pack")) {
    const next = text.slice(5).trim() || "default";
    if (PACKS[next]) {
      pack = next;
      line("ghost", `specter: wearing ${next}.`);
    } else {
      line("ghost", `specter: no pack called ${next}. try ${Object.keys(PACKS).join(", ")}.`);
    }
    return;
  }
  line("ghost", `specter: ${reply(text)}`);
});
