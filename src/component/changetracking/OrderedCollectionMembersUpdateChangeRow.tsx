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
        <OriginalValue changes={changes} />
      </td>
      <td>
        <NewValue changes={changes} />
      </td>

      <td></td>
    </tr>
  );
};

function isModified(change?: MembersChange) {
  return change && (change.removed || change.added);
}

/**
 * Filters member changes.
 * @return true when member should be included in the result, false otherwise.
 */
type ChangeFilter = (change: MembersChange) => boolean;

interface UnchangedMembrsProps extends HasChangeObjects {
  changeIndex: number;
  filter: ChangeFilter;
}

const UnchangedMembers = ({ changes, changeIndex }: UnchangedMembrsProps) => {
  const change = changes[changeIndex];

  const first = change.value[0];
  const last = change.value[change.count - 1];

  if (change.count === 1) {
    return <MemberIri member={first} />;
  }

  return (
    <div>
      {/*<If expression={changeIndex > 0}>*/}
      <MemberIri member={first} />
      {/*</If>*/}
      <If expression={change.count === 3}>
        <MemberIri member={change.value[1]} />
      </If>
      <If expression={change.count > 3}>...</If>
      {/*<If expression={changeIndex < changes.length - 1}>*/}
      <MemberIri member={last} />
      {/*</If>*/}
    </div>
  );
};

const AddedMembers = ({ change }: HasMembersChange) => {
  return (
    <div className={"bg-translucent-success rounded"}>
      {change.value.map((member, i) => (
        <MemberIri member={member} key={i} />
      ))}
    </div>
  );
};

const RemovedMembers = ({ change }: HasMembersChange) => {
  return (
    <div className={"bg-translucent-danger rounded"}>
      {change.value.map((member, i) => (
        <MemberIri member={member} key={i} />
      ))}
    </div>
  );
};

const EmptyLine = () => {
  return <div className={"collection-member-history-entry"}>&nbsp;</div>;
};

function renderChanges(changes: MembersChange[], filter: ChangeFilter) {
  return (
    <>
      {changes.map((change, i) => {
        if (!isModified(change)) {
          // block of unmodified members
          return (
            <UnchangedMembers
              changes={changes}
              filter={filter}
              changeIndex={i}
              key={"unchanged" + i}
            />
          );
        }

        // block of modified members matching the filter
        if (filter(change)) {
          if (change.added) {
            return <AddedMembers change={change} key={"added" + i} />;
          } else {
            return <RemovedMembers change={change} key={"removed" + i} />;
          }
        }

        let prev = i - 1 >= 0 ? changes.at(i - 1) : undefined;
        let next = changes.at(i + 1);

        if (!isModified(prev)) {
          prev = undefined;
        }
        if (!isModified(next)) {
          next = undefined;
        }

        const otherCount = Math.max(prev?.count ?? 0, next?.count ?? 0);

        const diffCount = change.count - otherCount;
        // removal always comes first
        // space will be inserted after removal and before addittion
        if (diffCount > 0) {
          return (
            <div key={"multi-empty" + i}>
              {Array(diffCount)
                .keys()
                .map((ii) => <EmptyLine key={"empty" + ii} />)
                .toArray()}
            </div>
          );
        }

        return null;
      })}
    </>
  );
}

const isAdded = (change: MembersChange) => change.added;
const NewValue = ({ changes }: HasChangeObjects) => {
  return renderChanges(changes, isAdded);
};

const isRemoved = (change: MembersChange) => change.removed;
const OriginalValue = ({ changes }: HasChangeObjects) => {
  return renderChanges(changes, isRemoved);
};

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
