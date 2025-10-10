import cron from "node-cron";
import RecurringExpense from "../models/RecurringExpense.js";
import Expense from "../models/Expense.js";
import User from "../models/User.js";
import { sendMail } from "../utils/sendMail.js";

/** Helper to add frequency */
function addFreq(date, frequency) {
  const d = new Date(date);
  if (frequency === "daily") d.setDate(d.getDate() + 1);
  else if (frequency === "weekly") d.setDate(d.getDate() + 7);
  else if (frequency === "monthly") d.setMonth(d.getMonth() + 1);
  else if (frequency === "yearly") d.setFullYear(d.getFullYear() + 1);
  return d;
}

export default function startRecurringJob() {
  cron.schedule("5 0 * * *", async () => {
    console.log("🔁 Recurring job running");
    try {
      const now = new Date();
      const recurrings = await RecurringExpense.find({ active: true });

      for (const r of recurrings) {
        let lastRun = r.lastRun || r.startDate || r.createdAt || r._id.getTimestamp();
        let nextRun = addFreq(lastRun, r.frequency);

        if (r.startDate && new Date(r.startDate) > now) continue;

        let updated = false;
        while (nextRun <= now) {
          const expense = await Expense.create({
            user: r.user,
            amount: r.amount,
            category: r.category || r.name,
            description: `Recurring (${r.frequency}) - ${r.name}`,
            date: nextRun,
          });

          // Send email reminder to the user
          const user = await User.findById(r.user);
          if (user && user.email) {
            await sendMail({
              to: user.email,
              subject: "Recurring Expense Applied",
              text: `A recurring expense "${r.name}" of amount ${r.amount} was added to your account.`,
              html: `<p>A recurring expense "<b>${r.name}</b>" of amount <b>${r.amount}</b> was added to your account.</p>`,
            });
          }

          lastRun = nextRun;
          nextRun = addFreq(nextRun, r.frequency);
          updated = true;
        }

        if (updated) {
          r.lastRun = lastRun;
          await r.save();
        }
      }
    } catch (err) {
      console.error("Recurring job error:", err);
    }
  }, {
    timezone: "UTC",
  });

  console.log("✅ Recurring job scheduled (daily at 00:05 UTC) with email notifications");
}
