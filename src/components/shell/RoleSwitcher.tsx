import { useState } from "react";
import { Repeat } from "lucide-react";
import type { FamilyMember } from "../../types";

const ROLE_LABEL: Record<FamilyMember["role"], string> = {
  recorder: "기록자",
  family_admin: "가족 관리자",
  family_member: "가족 구성원"
};

interface RoleSwitcherProps {
  members: FamilyMember[];
  activeId: string;
  onSwitch: (memberId: string) => void;
}

/** PRD 완료 조건: 데모에서 기록자·가족 역할을 전환할 수 있어야 한다. */
export function RoleSwitcher({ members, activeId, onSwitch }: RoleSwitcherProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="role-switch-fab">
      {open && (
        <div className="card" style={{ marginBottom: 10, display: "grid", gap: 8, width: 220 }}>
          <p className="helper-text" style={{ margin: 0 }}>
            데모용 역할 전환
          </p>
          {members.map((m) => (
            <button
              key={m.id}
              className={`choice-card ${m.id === activeId ? "selected" : ""}`}
              onClick={() => {
                onSwitch(m.id);
                setOpen(false);
              }}
            >
              <div>
                <strong>
                  {m.relationship} {m.displayName}
                </strong>
                <small>{ROLE_LABEL[m.role]}</small>
              </div>
            </button>
          ))}
        </div>
      )}
      <button onClick={() => setOpen((v) => !v)}>
        <Repeat size={15} /> 역할 전환
      </button>
    </div>
  );
}
