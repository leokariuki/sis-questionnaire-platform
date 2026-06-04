import type { TransferQuestion } from "@/lib/types";

/** Transfer / learning-after-SIS questions TR1–TR4 (spec §23). POST tests only. */
export const TRANSFER_QUESTIONS: TransferQuestion[] = [
  {
    kind: "scale",
    code: "TR1",
    wording: {
      KIDS_9_12: "Because of SIS, I try new things more independently.",
      TEENS_13_17: "Because of SIS, I feel more prepared for new situations.",
    },
    dbField: "TR1",
  },
  {
    kind: "scale",
    code: "TR2",
    wording: {
      KIDS_9_12: "I use what I learned at home or school.",
      TEENS_13_17: "I apply learning in daily life.",
    },
    dbField: "TR2",
  },
  {
    kind: "scale",
    code: "TR3",
    wording: {
      KIDS_9_12: "I feel more confident about future learning.",
      TEENS_13_17: "I feel more confident about studies or career.",
    },
    dbField: "TR3",
  },
  {
    kind: "open",
    code: "TR4",
    icon: "💬",
    prompt: "Write one example of something you learned and use.",
    dbField: "TR4_Open",
  },
];
