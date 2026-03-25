"""Rule engine — user-defined and learned organization rules."""

import uuid
import fnmatch


class RuleEngine:
    def __init__(self, db):
        self.db = db

    def get_rules(self):
        return self.db.get_rules()

    def add_rule(self, name, condition, destination):
        rule = {
            "id": str(uuid.uuid4()),
            "name": name,
            "condition": condition,
            "destination": destination,
            "enabled": True,
        }
        self.db.save_rule(rule)
        return rule

    def delete_rule(self, rule_id):
        self.db.delete_rule(rule_id)

    def match(self, file_meta):
        """Check if any rule matches the given file. Returns destination or None."""
        for rule in self.get_rules():
            if not rule.get("enabled", True):
                continue
            if fnmatch.fnmatch(file_meta["name"], rule["condition"]):
                return rule["destination"]
        return None
