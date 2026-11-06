import { FunctionComponent, useMemo } from "react";
import { OrderedCollectionMembersUpdateChangeRecord } from "../../model/changetracking/OrderedCollectionMembersUpdateChangeRecord";
import { useI18n } from "../hook/useI18n";
import { FormattedDate, FormattedTime } from "react-intl";
import { Badge } from "reactstrap";
import AssetLabel from "../misc/AssetLabel";
import { HasIdentifier } from "../../model/Asset";
import { ChangeObject, diffArrays } from "diff";
import If from "../misc/If";
import OutgoingLink from "../misc/OutgoingLink";

interface HasRecord {
  record: OrderedCollectionMembersUpdateChangeRecord;
}

type MembersChange = ChangeObject<HasIdentifier[]>;

interface HasChangeObjects {
  changes: MembersChange[];
}

interface HasMembersChange {
  change: MembersChange;
}

export const OrderedCollectionMembersUpdateChangeRow: FunctionComponent<
  HasRecord
> = ({ record }) => {
  const { i18n } = useI18n();
  const created = new Date(Date.parse(record.timestamp));

  const changes = useMemo(() => {
    if (record.originalValue == null || record.newValue == null) {
      return [];
    }

    return diffArrays(record.originalValue, record.newValue, {
      comparator: (a, b) => a.iri === b.iri,
    });
  }, [record]);

  return (
    <tr>
      <td>
        <div>
          <FormattedDate value={created} /> <FormattedTime value={created} />
        </div>
        <div className="italics last-edited-message ml-2">
          {record.author.fullName}
        </div>
      </td>
      <td>
        <Badge color="secondary">{i18n(record.typeLabel)}</Badge>
      </td>
      <td>
        <AssetLabel iri={record.changedAttribute.iri} />
      </td>
      <td>
        <Removals changes={changes} />
      </td>
      <td>
        <Additions changes={changes} />
      </td>

      <td></td>
    </tr>
  );
};

function isModified(change: MembersChange) {
  return change.removed || change.added;
}

interface UnchangedMembrsProps extends HasChangeObjects {
  changeIndex: number;
  isChange: (change: MembersChange) => boolean;
}

const UnchangedMembers = ({
  changes,
  changeIndex,
  isChange,
}: UnchangedMembrsProps) => {
  const change = changes[changeIndex];
  const hasNext = hasNextChange(changes, changeIndex, isChange);
  const hasPrev = hasPrevChange(changes, changeIndex, isChange);

  const first = change.value[0];
  const last = change.value[change.count - 1];
  if (change.count === 1 || !hasNext) {
    return (
      <>
        <If expression={changeIndex > 0 && !hasPrev}>...</If>
        <MemberIri member={first} />
        <If expression={change.count > 1}>...</If>
      </>
    );
  }
  if (!hasPrev) {
    return (
      <>
        <If expression={change.count > 1}>...</If>
        <MemberIri member={last} />
        <If expression={changeIndex < change.count - 1 && !hasNext}>...</If>
      </>
    );
  }
  return (
    <div>
      <If expression={changeIndex > 0}>...</If>
      <MemberIri member={first} />
      <If expression={change.count > 2}>...</If>
      <MemberIri member={last} />
      <If expression={changeIndex < change.count - 1}>...</If>
    </div>
  );
};

const AddedMembers = ({ change }: HasMembersChange) => {
  return (
    <div className={"bg-translucent-success"}>
      {change.value.map((member, i) => (
        <MemberIri member={member} key={i} />
      ))}
    </div>
  );
};

const RemovedMembers = ({ change }: HasMembersChange) => {
  return (
    <div className={"bg-translucent-danger"}>
      {change.value.map((member, i) => (
        <MemberIri member={member} key={i} />
      ))}
    </div>
  );
};

function computeChangesWithSurroundings(
  changes: MembersChange[],
  isChange: (change: MembersChange) => boolean
) {
  const result: MembersChange[] = [];

  for (let i = 0; i < changes.length; i++) {
    const change = changes[i];
    if (!isChange(change)) {
      continue;
    }
    // found a chunk of added members
    // first push previous chunk of unmodified
    for (let j = i - 1; j >= 0; j--) {
      if (isModified(changes[j])) {
        continue;
      }
      // last chunk of unmodified members
      result.push(changes[j]);
      break;
    }
    // push addition
    result.push(change);
    // push next unmodified chunk
    for (let j = i + 1; j < changes.length; j++) {
      if (isModified(changes[j])) {
        continue;
      }
      result.push(changes[j]);
      break;
    }
  }

  return result;
}

function renderChanges(
  changes: MembersChange[],
  isChange: (change: MembersChange) => boolean
) {
  return (
    <>
      {changes.map((change, i) => {
        if (isModified(change)) {
          if (change.added) {
            return <AddedMembers change={change} key={i} />;
          } else {
            return <RemovedMembers change={change} key={i} />;
          }
        }
        return (
          <UnchangedMembers
            changes={changes}
            isChange={isChange}
            changeIndex={i}
            key={i}
          />
        );
      })}
    </>
  );
}

const isAdded = (change: MembersChange) => change.added;
const Additions = ({ changes }: HasChangeObjects) => {
  const additions = useMemo(
    () => computeChangesWithSurroundings(changes, isAdded),
    [changes]
  );

  return renderChanges(additions, isAdded);
};

const isRemoved = (change: MembersChange) => change.removed;
const Removals = ({ changes }: HasChangeObjects) => {
  const removals = useMemo(
    () => computeChangesWithSurroundings(changes, isRemoved),
    [changes]
  );

  return renderChanges(removals, isRemoved);
};

function hasNextChange(
  changes: MembersChange[],
  index: number,
  isChange: (change: MembersChange) => boolean
) {
  if (index >= changes.length - 1) return false;
  return isChange(changes[index + 1]);
}

function hasPrevChange(
  changes: MembersChange[],
  index: number,
  isChange: (change: MembersChange) => boolean
) {
  if (index < 1) return false;
  return isChange(changes[index - 1]);
}

const MemberIri = ({ member }: { member: HasIdentifier }) => {
  const iri = member.iri;
  return (
    <div>
      <OutgoingLink
        label={<AssetLabel iri={iri} shrinkFullIri={true} />}
        iri={iri}
      />
    </div>
  );
};
