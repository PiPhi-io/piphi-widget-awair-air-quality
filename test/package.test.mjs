import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { validateDeclarativeWidgetRecipe } from "piphi-network-widget-sdk/declarative";

const source = JSON.parse(readFileSync(new URL("../package.source.json", import.meta.url), "utf8"));

test("package identity and integration linkage are stable", () => {
  assert.deepEqual(source.identity, {
    publisher_id: "io.piphi",
    package_id: "awair-air-quality",
    version: "0.1.13",
  });
  assert.equal(source.owning_integration_id, "awair-element-local-api");
  assert.deepEqual(source.recommended_for_integrations, ["awair-element-local-api"]);
  assert.equal(source.requires_integrations[0].integration_id, "awair-element-local-api");
});

test("the native recipe passes the Widget SDK contract", () => {
  assert.equal(source.widgets.length, 1);
  const widget = source.widgets[0];
  assert.equal(widget.runtime, "declarative");
  const diagnostics = validateDeclarativeWidgetRecipe(widget.recipe, {
    bindingSlotIds: widget.binding_slots.map((slot) => slot.id),
    settingIds: (widget.settings ?? []).map((setting) => setting.id),
  });
  assert.deepEqual(diagnostics, []);
});

test("the widget is read-only and requests no browser or command permissions", () => {
  const widget = source.widgets[0];
  assert.deepEqual(widget.permissions ?? [], []);
  assert.deepEqual(widget.allowed_commands ?? [], []);
  assert.ok(widget.binding_slots.every((slot) => slot.binding_modes.length === 1 && slot.binding_modes[0] === "read"));
});
