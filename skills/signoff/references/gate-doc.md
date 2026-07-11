# The hosted gate document

Section presence and scenario order follow the canonical rules in [the spec template](../../spec/references/template.md); the hosted order below is fixed.

````markdown
# {{FEATURE_NAME}}

To change anything, comment on it. To approve, comment `SIGNED {{FEATURE_SLUG}}`.

Done means every scenario on this page works in the finished product, and the delivery reads them back to you as a checklist with the evidence for each. Where the work includes recorded QA drives, that evidence is a recording of a tester performing the scenario on the finished build — the same screens you see here, moving. Where it includes mutation testing, we flip the exact values you sign here and the tests must break — proof the tests really read this spec. The checks listed beneath a scenario have no generated test; the tester verifies each one on the finished product.

Anything we decided without you sits under Our calls — veto it with a comment; signing accepts it.

Approving starts the build: {{RUN_ESTIMATE}} of autonomous work, on a machine that stays awake for it.

You'll only hear from the run if a discovery changes the Direction, the work turns out to be several deliverables, something needs credentials or a paid service, or a step would be destructive. Otherwise the next thing you read is the delivery.

## Intent
{{INTENT}}
{{PRIMARY_SCENARIO_FLOW_STRIP}}

## Direction
{{DIRECTION}}

## Scenario — {{SCENARIO_NAME}}
```gherkin
{{SCENARIO_GHERKIN}}
```
{{STORYBOARD_FRAMES}}
{{ACCEPTANCE_CHECKS}}

{{REPEAT_SCENARIO_SECTION}}

## Glossary
{{DOMAIN_GLOSSARY}}

## Testing
{{ONE_LINE_PER_SCENARIO_AND_ANY_EXTRA_PROBES}}

## Non-goals
{{NON_GOALS}}

## Decisions log
**You said**
{{USER_DECISIONS}}

**Our calls — veto by comment**
{{OUR_CALLS}}
````
