#!/bin/bash
# Creates PocketBase collections via the admin API
# Usage: ./scripts/setup-collections.sh [PB_URL] [EMAIL] [PASSWORD]

PB_URL="${1:-http://127.0.0.1:8090}"
EMAIL="${2:-admin@websheet.local}"
PASSWORD="${3:-Passw0rd2026x}"

# Auth
TOKEN=$(curl -s -X POST "$PB_URL/api/collections/_superusers/auth-with-password" \
  --data-urlencode "identity=$EMAIL" \
  --data-urlencode "password=$PASSWORD" | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")

if [ -z "$TOKEN" ]; then
  echo "Failed to authenticate"
  exit 1
fi
echo "Authenticated."

create_collection() {
  local name="$1"
  local body="$2"
  echo -n "Creating $name... "
  local resp
  resp=$(curl -s -X POST "$PB_URL/api/collections" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "$body")
  if echo "$resp" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('name',''))" 2>/dev/null | grep -q "$name"; then
    echo "OK"
  else
    echo "FAILED: $resp"
  fi
}

# -- Spells --
create_collection "spells" '{
  "name": "spells",
  "type": "base",
  "listRule": "",
  "viewRule": "",
  "createRule": "",
  "updateRule": "",
  "deleteRule": "",
  "fields": [
    {"name": "name", "type": "text", "required": true},
    {"name": "source", "type": "text", "required": true},
    {"name": "edition", "type": "select", "values": ["classic", "one"]},
    {"name": "level", "type": "number"},
    {"name": "school", "type": "text", "required": true},
    {"name": "time", "type": "json"},
    {"name": "range", "type": "json"},
    {"name": "components", "type": "json"},
    {"name": "duration", "type": "json"},
    {"name": "entries", "type": "json"},
    {"name": "entriesHigherLevel", "type": "json"},
    {"name": "isRitual", "type": "bool"},
    {"name": "damageInflict", "type": "json"},
    {"name": "conditionInflict", "type": "json"},
    {"name": "savingThrow", "type": "json"},
    {"name": "spellAttack", "type": "json"},
    {"name": "classes", "type": "json"}
  ],
  "indexes": [
    "CREATE INDEX idx_spells_name ON spells (name)",
    "CREATE INDEX idx_spells_level ON spells (level)",
    "CREATE UNIQUE INDEX idx_spells_name_source ON spells (name, source)"
  ]
}'

# -- Classes --
create_collection "classes" '{
  "name": "classes",
  "type": "base",
  "listRule": "",
  "viewRule": "",
  "createRule": "",
  "updateRule": "",
  "deleteRule": "",
  "fields": [
    {"name": "name", "type": "text", "required": true},
    {"name": "source", "type": "text", "required": true},
    {"name": "edition", "type": "select", "values": ["classic", "one"]},
    {"name": "hitDie", "type": "number"},
    {"name": "primaryAbility", "type": "json"},
    {"name": "savingThrows", "type": "json"},
    {"name": "spellcastingAbility", "type": "text"},
    {"name": "casterProgression", "type": "text"},
    {"name": "armorProficiencies", "type": "json"},
    {"name": "weaponProficiencies", "type": "json"},
    {"name": "toolProficiencies", "type": "json"},
    {"name": "skillChoices", "type": "json"},
    {"name": "startingEquipment", "type": "json"},
    {"name": "classFeatures", "type": "json"},
    {"name": "subclassTitle", "type": "text"},
    {"name": "multiclassing", "type": "json"},
    {"name": "cantripProgression", "type": "json"},
    {"name": "preparedSpellsProgression", "type": "json"},
    {"name": "spellSlotProgression", "type": "json"}
  ],
  "indexes": [
    "CREATE UNIQUE INDEX idx_classes_name_source ON classes (name, source)"
  ]
}'

# -- Subclasses --
create_collection "subclasses" '{
  "name": "subclasses",
  "type": "base",
  "listRule": "",
  "viewRule": "",
  "createRule": "",
  "updateRule": "",
  "deleteRule": "",
  "fields": [
    {"name": "name", "type": "text", "required": true},
    {"name": "shortName", "type": "text"},
    {"name": "source", "type": "text", "required": true},
    {"name": "className", "type": "text", "required": true},
    {"name": "classSource", "type": "text", "required": true},
    {"name": "edition", "type": "select", "values": ["classic", "one"]},
    {"name": "features", "type": "json"},
    {"name": "spellcastingAbility", "type": "text"}
  ],
  "indexes": [
    "CREATE UNIQUE INDEX idx_subclasses_name_source ON subclasses (name, source, className, classSource)",
    "CREATE INDEX idx_subclasses_class ON subclasses (className, classSource)"
  ]
}'

# -- Class Features --
create_collection "class_features" '{
  "name": "class_features",
  "type": "base",
  "listRule": "",
  "viewRule": "",
  "createRule": "",
  "updateRule": "",
  "deleteRule": "",
  "fields": [
    {"name": "name", "type": "text", "required": true},
    {"name": "source", "type": "text", "required": true},
    {"name": "className", "type": "text", "required": true},
    {"name": "classSource", "type": "text", "required": true},
    {"name": "level", "type": "number"},
    {"name": "entries", "type": "json"},
    {"name": "isSubclassFeature", "type": "bool"},
    {"name": "subclassName", "type": "text"}
  ],
  "indexes": [
    "CREATE INDEX idx_cf_class_level ON class_features (className, classSource, level)"
  ]
}'

# -- Races --
create_collection "races" '{
  "name": "races",
  "type": "base",
  "listRule": "",
  "viewRule": "",
  "createRule": "",
  "updateRule": "",
  "deleteRule": "",
  "fields": [
    {"name": "name", "type": "text", "required": true},
    {"name": "source", "type": "text", "required": true},
    {"name": "edition", "type": "select", "values": ["classic", "one"]},
    {"name": "size", "type": "json"},
    {"name": "speed", "type": "json"},
    {"name": "darkvision", "type": "number"},
    {"name": "abilityBonuses", "type": "json"},
    {"name": "resistances", "type": "json"},
    {"name": "immunities", "type": "json"},
    {"name": "conditionImmunities", "type": "json"},
    {"name": "skillProficiencies", "type": "json"},
    {"name": "weaponProficiencies", "type": "json"},
    {"name": "toolProficiencies", "type": "json"},
    {"name": "languages", "type": "json"},
    {"name": "traits", "type": "json"}
  ],
  "indexes": [
    "CREATE UNIQUE INDEX idx_races_name_source ON races (name, source)"
  ]
}'

# -- Items --
create_collection "items" '{
  "name": "items",
  "type": "base",
  "listRule": "",
  "viewRule": "",
  "createRule": "",
  "updateRule": "",
  "deleteRule": "",
  "fields": [
    {"name": "name", "type": "text", "required": true},
    {"name": "source", "type": "text", "required": true},
    {"name": "edition", "type": "select", "values": ["classic", "one"]},
    {"name": "type", "type": "text"},
    {"name": "rarity", "type": "text"},
    {"name": "weight", "type": "number"},
    {"name": "value", "type": "number"},
    {"name": "weaponCategory", "type": "text"},
    {"name": "damage", "type": "text"},
    {"name": "damageType", "type": "text"},
    {"name": "versatileDamage", "type": "text"},
    {"name": "range", "type": "text"},
    {"name": "properties", "type": "json"},
    {"name": "ac", "type": "number"},
    {"name": "strengthRequirement", "type": "number"},
    {"name": "stealthDisadvantage", "type": "bool"},
    {"name": "requiresAttunement", "type": "json"},
    {"name": "bonusWeapon", "type": "text"},
    {"name": "bonusAc", "type": "text"},
    {"name": "bonusSpellAttack", "type": "text"},
    {"name": "bonusSpellSaveDc", "type": "text"},
    {"name": "entries", "type": "json"},
    {"name": "isHomebrew", "type": "bool"},
    {"name": "homebrewCreatedBy", "type": "text"}
  ],
  "indexes": [
    "CREATE INDEX idx_items_name ON items (name)",
    "CREATE INDEX idx_items_type ON items (type)"
  ]
}'

# -- Backgrounds --
create_collection "backgrounds" '{
  "name": "backgrounds",
  "type": "base",
  "listRule": "",
  "viewRule": "",
  "createRule": "",
  "updateRule": "",
  "deleteRule": "",
  "fields": [
    {"name": "name", "type": "text", "required": true},
    {"name": "source", "type": "text", "required": true},
    {"name": "edition", "type": "select", "values": ["classic", "one"]},
    {"name": "skillProficiencies", "type": "json"},
    {"name": "toolProficiencies", "type": "json"},
    {"name": "languages", "type": "json"},
    {"name": "startingEquipment", "type": "json"},
    {"name": "feats", "type": "json"},
    {"name": "feature", "type": "json"},
    {"name": "entries", "type": "json"}
  ],
  "indexes": [
    "CREATE UNIQUE INDEX idx_bg_name_source ON backgrounds (name, source)"
  ]
}'

# -- Characters --
create_collection "characters" '{
  "name": "characters",
  "type": "base",
  "listRule": "",
  "viewRule": "",
  "createRule": "",
  "updateRule": "",
  "deleteRule": "",
  "fields": [
    {"name": "name", "type": "text", "required": true},
    {"name": "passphraseHash", "type": "text"},
    {"name": "edition", "type": "select", "required": true, "values": ["classic", "one"]},
    {"name": "playerName", "type": "text"},
    {"name": "raceId", "type": "text"},
    {"name": "raceName", "type": "text"},
    {"name": "subraceId", "type": "text"},
    {"name": "subraceName", "type": "text"},
    {"name": "backgroundId", "type": "text"},
    {"name": "backgroundName", "type": "text"},
    {"name": "classes", "type": "json"},
    {"name": "alignment", "type": "text"},
    {"name": "abilities", "type": "json", "required": true},
    {"name": "hp", "type": "number"},
    {"name": "maxHp", "type": "number"},
    {"name": "tempHp", "type": "number"},
    {"name": "ac", "type": "number"},
    {"name": "speed", "type": "json"},
    {"name": "initiative", "type": "number"},
    {"name": "proficiencyBonus", "type": "number"},
    {"name": "deathSaves", "type": "json"},
    {"name": "hitDice", "type": "json"},
    {"name": "conditions", "type": "json"},
    {"name": "savingThrowProficiencies", "type": "json"},
    {"name": "skillProficiencies", "type": "json"},
    {"name": "skillExpertise", "type": "json"},
    {"name": "armorProficiencies", "type": "json"},
    {"name": "weaponProficiencies", "type": "json"},
    {"name": "toolProficiencies", "type": "json"},
    {"name": "languages", "type": "json"},
    {"name": "spellcastingAbility", "type": "text"},
    {"name": "spellSlots", "type": "json"},
    {"name": "spells", "type": "json"},
    {"name": "items", "type": "json"},
    {"name": "currency", "type": "json"},
    {"name": "attunementSlots", "type": "number"},
    {"name": "featureIds", "type": "json"},
    {"name": "resources", "type": "json"},
    {"name": "level", "type": "number"},
    {"name": "xp", "type": "number"},
    {"name": "inspiration", "type": "bool"},
    {"name": "notes", "type": "text"},
    {"name": "portraitUrl", "type": "text"}
  ],
  "indexes": [
    "CREATE INDEX idx_char_name ON characters (name)"
  ]
}'

echo ""
echo "Done! Collections created."
