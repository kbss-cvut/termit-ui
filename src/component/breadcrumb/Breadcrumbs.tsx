import React from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import TermItState from "../../model/TermItState";

// Specify BEM block name
const block = "breadcrumbs";

interface BreadcrumbsProps {
  className: string;
  hidden?: boolean;
  separator: React.ReactNode;
  wrapper?: React.ComponentType<any>;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  className = "",
  hidden = false,
  separator = ">",
  wrapper = (props: any) => <nav {...props}>{props.children}</nav>,
  children,
}) => {
  let hiddenMod = hidden ? `${block}--hidden` : "";
  const crumbs = useSelector((state: TermItState) =>
    state.breadcrumbs.sort((a, b) => {
      return a.pathname.length - b.pathname.length;
    })
  );
  const Wrapper = wrapper;

  return (
    <div className={className}>
      <Wrapper className={`${block} ${hiddenMod}`}>
        <div className={`${block}__inner`}>
          {crumbs.map((crumb, i) => (
            <span key={crumb.id} className={`${block}__section`}>
              <NavLink
                exact
                className={`${block}__crumb`}
                activeClassName={`${block}__crumb--active`}
                to={{
                  pathname: crumb.pathname,
                  search: crumb.search,
                }}
              >
                {crumb.title}
              </NavLink>

              {i < crumbs.length - 1 ? (
                <span className={`${block}__separator`}>{separator}</span>
              ) : null}
            </span>
          ))}
        </div>
      </Wrapper>

      {children}
    </div>
  );
};

export default Breadcrumbs;
