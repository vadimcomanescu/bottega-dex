# The hosted gate document

Section presence and scenario order follow the canonical rules in [the spec template](../../spec/references/template.md); the hosted order below is fixed.

````markdown
# {{FEATURE_NAME}}

To change anything, comment on it. To approve, comment `SIGNED {{FEATURE_SLUG}}`.

Done means every scenario on this page works in the finished product. A tester performs each one on the finished build, and the delivery shows you the recording of that session — the same screens you see here, moving, one checked scenario at a time.

Every check can fail: we flip the exact values you sign here and the tests must break — proof the tests really read this contract. The checks listed beneath a scenario have no generated test; the tester verifies each one on the finished product.

Anything we decided without you sits under Our calls — veto it with a comment; signing accepts it.

You'll only hear from the run if a discovery changes the Direction, the work turns out to be several commissions, something needs credentials or a paid service, or a step would be destructive. Otherwise the next thing you read is the delivery.

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
{{MAESTRO_DECISIONS}}
````
