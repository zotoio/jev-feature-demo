#!/usr/bin/env node
import { triageSupportTicket } from "../demos/support-ticket-triage.js";

const ticket =
  process.argv.slice(2).join(" ") ||
  "URGENT: I was charged twice for my annual plan. Please refund one charge today.";

const output = await triageSupportTicket({ ticket, json: process.env.JSON === "1" });
console.log(output);
