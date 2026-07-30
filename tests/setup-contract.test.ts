import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(import.meta.dirname, "..");

function read(path: string): string {
  return readFileSync(join(ROOT, path), "utf8");
}

describe("setup v2 semantic reconciliation", () => {
  const setup = read("plugins/bottega-dex/skills/setup/SKILL.md");

  it("uses existing semantic owners and creates only actual routes", () => {
    expect(setup).toContain("An existing map route or owner doc wins wherever it lives");
    expect(setup).toContain("This procedure is safe to rerun.");
    expect(setup).toContain("A conforming repository receives no file or GitHub changes.");
    expect(setup).toContain("<!-- bottega-dex:setup v2 begin -->");
    expect(setup).toContain("<!-- bottega-dex:setup v1 begin -->");
    expect(setup).toContain("First reconcile an existing v1 block as setup-owned routes");
    expect(setup).toContain("Never leave both versions.");
    expect(setup).toContain("When no equivalent owner exists, use `docs/agents/issue-tracker.md` and `docs/agents/domain.md`");
  });

  it("gives domain consumers one owner and migrates real material", () => {
    expect(setup).toContain("This is separate from `CONTEXT-MAP.md`, which maps bounded contexts and is not an agent map.");
    expect(setup).toContain("The domain owner tells consumers where vocabulary, relevant contexts, and declared root or system and context-local ADRs live.");
    expect(setup).toContain("The glossary vocabulary governs new output, and a relevant ADR conflict is surfaced for a decision.");
    expect(setup).toContain("outside the vocabulary home declared by the domain owner");
    expect(setup).toContain("A new Bottega Dex-owned layout uses the relevant `CONTEXT.md`.");
    expect(read("plugins/bottega-dex/skills/discover/SKILL.md")).toContain("Treat genuinely absent domain material as absent, not as a setup requirement.");
    expect(read("plugins/bottega-dex/skills/improve/SKILL.md")).toContain("Treat genuinely absent domain material as absent, not as a setup requirement.");
  });

  it("keeps GitHub claims, triage, and landing conditional on repository evidence", () => {
    expect(setup).toContain("Bottega Dex routes only to GitHub and does not import a tracker or triage engine.");
    expect(setup).toContain("only when the repository declares or surfaces a compatible triage capability");
    expect(setup).toContain("concrete read, assign, comment, and close operations");
    expect(setup).toContain("Reuse an equivalent tracker owner and its existing claim protocol.");
    expect(setup).toContain("no concurrency-safe claim exists");
    expect(setup).toContain("git push -u origin <branch> --force-with-lease=refs/heads/<branch>:");
    expect(setup).toContain("Assignment is the human-visible signal, not the lock");
    expect(setup).toContain("[merge-governance reference](references/merge-governance.md)");
    const governance = read("plugins/bottega-dex/skills/setup/references/merge-governance.md");
    expect(governance).toContain("Ensure CI also runs for `merge_group`");
    expect(governance).toContain("merge_protections_settings.auto_merge_conditions");
    expect(governance).toContain("`opened`, `reopened`, `synchronize`, `labeled`, and `unlabeled`");
    expect(governance).toContain("Do not merge directly.");
    const start = read("plugins/bottega-dex/skills/start/SKILL.md");
    expect(start).toContain("Follow its claim procedure without changing the user's checkout.");
    expect(start).toContain("reserve that claim from the isolated worktree");
    expect(start).toContain("complete any assignment or other human-visible signal");
    expect(start).toContain("Preserve the tracker owner's force-push rule.");
    expect(start).toContain("When the tracker procedure already created the branch remotely, do not create or rename it again.");
    expect(start).toContain("When no map or command owner exists, discover the commands from the repository");
  });
});
