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
import "./OrderedCollectionMembersUpdateChangeRow.scss";
import classNames from "classnames";

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

/**
 * A single table row showing the difference between original and new SKOS collection members.
 */
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
      <td>{renderChanges(changes, (change) => change.removed)}</td>
      <td>{renderChanges(changes, (change) => change.added)}</td>

      <td></td>
    </tr>
  );
};

/**
 * @returns true when the change represents removal or addition, false otherwise
 */
function isModified(change?: MembersChange) {
  return change && (change.removed || change.added);
}

/**
 * Filters member changes.
 * @return true when member should be included in the result, false otherwise.
 */
type ChangeFilter = (change: MembersChange) => boolean;

/**
 * Renders a block of unchanged members.
 * Only the first and last members of the block are rendered collapsing the members between them if there are two or more.
 */
const UnchangedMembers = ({ change }: HasMembersChange) => {
  const first = change.value[0];
  const last = change.value[change.count - 1];

  if (change.count === 1) {
    return <MemberIri member={first} />;
  }

  return (
    <div className={"unchanged-members"}>
      <MemberIri member={first} />
      <If expression={change.count === 3}>
        <MemberIri member={change.value[1]} />
      </If>
      <If expression={change.count > 3}>...</If>
      <MemberIri member={last} />
    </div>
  );
};

interface ChangedBlockOfMembersProps extends HasMembersChange {
  // whether the change should be visually hidden
  visible: boolean;
  className: string;
}

/**
 * Renders a block of changed members
 */
const ChangedBlockOfMembers = ({
  change,
  visible,
  className,
}: ChangedBlockOfMembersProps) => {
  return (
    <div
      className={classNames(className, "rounded", {
        hidden: !visible,
      })}
    >
      {change.value.map((member, i) => (
        <MemberIri member={member} key={i} />
      ))}
    </div>
  );
};

interface ChangedMembersProps extends HasChangeObjects {
  // the starting index from which blocks of modified members should be rendered
  startIndex: number;
  filter: ChangeFilter;
}

/**
 * Renders a block of changed members (merging addition and removal changes) starting from the startIndex.
 */
const ChangedMembers = ({
  changes,
  startIndex,
  filter,
}: ChangedMembersProps) => {
  let finalIndex = startIndex;
  for (let i = startIndex; i < changes.length; i++) {
    const change = changes[i];
    if (isModified(change)) {
      finalIndex = i;
    } else {
      break;
    }
  }

  return (
    <div className={"changed-members"}>
      {changes.slice(startIndex, finalIndex + 1).map((change, i) => {
        if (change.added) {
          return (
            <ChangedBlockOfMembers
              className={"added"}
              change={change}
              visible={filter(change)}
              key={i}
            />
          );
        }
        if (change.removed) {
          return (
            <ChangedBlockOfMembers
              className={"removed"}
              change={change}
              visible={filter(change)}
              key={i}
            />
          );
        }
        return null;
      })}
    </div>
  );
};

function renderChanges(changes: MembersChange[], filter: ChangeFilter) {
  return (
    <>
      {changes.map((change, i) => {
        if (!isModified(change)) {
          // block of unmodified members
          return <UnchangedMembers change={change} key={"unchanged" + i} />;
        }

        let prev = i - 1 >= 0 ? changes.at(i - 1) : undefined;
        return (
          <If expression={!prev || !isModified(prev)} key={"if-prev-" + i}>
            <ChangedMembers changes={changes} startIndex={i} filter={filter} />
          </If>
        );
      })}
    </>
  );
}

const MemberIri = ({ member }: { member: HasIdentifier }) => {
  const iri = member.iri;
  return (
    <div className={"collection-member-history-entry"}>
      <OutgoingLink
        label={<AssetLabel iri={iri} shrinkFullIri={true} />}
        iri={iri}
      />
    </div>
  );
};
