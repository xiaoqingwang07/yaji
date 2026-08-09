import { describe, expect, it } from "vitest";
import {
  EventStage,
  EventType,
  InviteFacingRole,
  MeasurementSource,
  OnboardingPhase,
  EVENT_TYPE_LABELS,
} from "./enums";
import { onboardFamilySchema } from "./schemas/family";
import { createEventSchema } from "./schemas/event";

describe("contracts v2.0 alignment with prototype", () => {
  it("includes PRECONCEPTION stage and VISIT_RECORDING type", () => {
    expect(EventStage.PRECONCEPTION).toBe("PRECONCEPTION");
    expect(EventType.VISIT_RECORDING).toBe("VISIT_RECORDING");
    expect(EVENT_TYPE_LABELS.VISIT_RECORDING).toBe("就诊录音");
  });

  it("invite facing roles exclude OWNER", () => {
    expect(Object.keys(InviteFacingRole).sort()).toEqual(["EDITOR", "VIEWER"]);
  });

  it("supports three-phase onboard schema", () => {
    expect(
      onboardFamilySchema.parse({
        phase: OnboardingPhase.PLANNING,
      }).phase,
    ).toBe("PLANNING");
    expect(
      onboardFamilySchema.parse({
        phase: OnboardingPhase.PREGNANCY,
        dueDate: "2026-12-01",
      }).phase,
    ).toBe("PREGNANCY");
    expect(
      onboardFamilySchema.parse({
        phase: OnboardingPhase.BORN,
        babyBirthDate: "2026-01-15",
      }).phase,
    ).toBe("BORN");
  });

  it("accepts cost fields on events", () => {
    const event = createEventSchema.parse({
      type: EventType.PRENATAL_CHECK,
      stage: EventStage.PREGNANCY,
      title: "建档产检",
      occurredAt: "2026-06-01T10:00:00+08:00",
      costAmount: 320,
      costNote: "自费部分",
    });
    expect(event.costAmount).toBe(320);
    expect(MeasurementSource.HOME_MONITOR).toBe("HOME_MONITOR");
  });
});
