// Copyright 2017-2022 @polkadot/apps authors & contributors
// SPDX-License-Identifier: Apache-2.0
import type { TFunction } from 'i18next';
import type { Route, Routes } from '@polkadot/apps-routing/types';
import type { ApiProps } from '@polkadot/react-api/types';
import type { AccountId } from '@polkadot/types/interfaces';
import type { Group, Groups, ItemRoute } from './types';

import React, { useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { AiOutlineMenu } from 'react-icons/ai';
import { CgProfile } from 'react-icons/cg';
import {MdKeyboardArrowRight} from 'react-icons/md'

import createRoutes from '@polkadot/apps-routing';
import { useAccounts, useApi, useCall, useTeleport } from '@polkadot/react-hooks';

import { findMissingApis } from '../endpoint';
import { useTranslation } from '../translate';
import ChainInfo from './ChainInfo';
import Grouping from './Grouping';
import Item from './Item';
import NodeInfo from './NodeInfo';
import Tabs from '../../../react-components/src/Menu/index';
interface Props {
  className?: string;
}

function createExternals (t: TFunction): ItemRoute[] {
  return [
    {
      href: 'https://github.com/polkadot-js/apps',
      icon: 'code-branch',
      name: 'github',
      text: t<string>('nav.github', 'GitHub', { ns: 'apps-routing' })
    },
    {
      href: 'https://wiki.polkadot.network',
      icon: 'book',
      name: 'wiki',
      text: t<string>('nav.wiki', 'Wiki', { ns: 'apps-routing' })
    }
  ];
}

function checkVisible ({ api, isApiConnected, isApiReady, isDevelopment: isApiDevelopment }: ApiProps, allowTeleport: boolean, hasAccounts: boolean, hasSudo: boolean, { isDevelopment, isHidden, needsAccounts, needsApi, needsApiCheck, needsApiInstances, needsSudo, needsTeleport }: Route['display']): boolean {
  if (isHidden) {
    return false;
  } else if (needsAccounts && !hasAccounts) {
    return false;
  } else if (!needsApi) {
    return true;
  } else if (!isApiReady || !isApiConnected) {
    return false;
  } else if (needsSudo && !hasSudo) {
    return false;
  } else if (needsTeleport && !allowTeleport) {
    return false;
  } else if (!isApiDevelopment && isDevelopment) {
    return false;
  }

  return findMissingApis(api, needsApi, needsApiInstances, needsApiCheck).length === 0;
}

function extractGroups (routing: Routes, groupNames: Record<string, string>, apiProps: ApiProps, allowTeleport: boolean, hasAccounts: boolean, hasSudo: boolean): Group[] {
  return Object
    .values(
      routing.reduce((all: Groups, route): Groups => {
        if (!all[route.group]) {
          all[route.group] = {
            name: groupNames[route.group],
            routes: [route]
          };
        } else {
          all[route.group].routes.push(route);
        }

        return all;
      }, {})
    )
    .map(({ name, routes }): Group => ({
      name,
      routes: routes.filter(({ display }) =>
        checkVisible(apiProps, allowTeleport, hasAccounts, hasSudo, display)
      )
    }))
    .filter(({ routes }) => routes.length);
}

function Menu ({ className = '' }: Props): React.ReactElement<Props> {
  const [navApperience,setNavApperience]=useState<boolean>(false);
  const [subCategory, setSubCategory] = useState<boolean>(false);
  const [clickedSubCategory, setClickedSubCategory] = useState<string>('');
  const { t } = useTranslation();
  const { allAccounts, hasAccounts } = useAccounts();
  const apiProps = useApi();
  const { allowTeleport } = useTeleport();
  const sudoKey = useCall<AccountId>(apiProps.isApiReady && apiProps.api.query.sudo?.key);
  const location = useLocation();
  const externalRef = useRef(createExternals(t));
  const routeRef = useRef(createRoutes(t));

  const groupRef = useRef({
    accounts: t('Accounts'),
    developer: t('Developer'),
    files: t('Files'),
    governance: t('Governance'),
    network: t('Network'),
    settings: t('Settings')
  });

  const hasSudo = useMemo(
    () => !!sudoKey && allAccounts.some((a) => sudoKey.eq(a)),
    [allAccounts, sudoKey]
  );

  const visibleGroups = useMemo(
    () => extractGroups(routeRef.current, groupRef.current, apiProps, allowTeleport, hasAccounts, hasSudo),
    [allowTeleport, apiProps, hasAccounts, hasSudo]
  );

  const activeRoute = useMemo(
    () => routeRef.current.find(({ name }) =>
      location.pathname.startsWith(`/${name}`)
    ) || null,
    [location]
  );
    const subCategoryHandeler = (item: string)=>{
      setSubCategory(!subCategory);
      setClickedSubCategory(item)
    }
    const closeMenuHandeler=()=>{
          if (navApperience)
          {setNavApperience(!navApperience)};
          if (subCategory)
          {setSubCategory(!subCategory)}
    }
  return (
    <div className={`${className}${(!apiProps.isApiReady || !apiProps.isApiConnected) ? ' isLoading' : ''} highlight--bg`}>
         <div className={`${navApperience? 'small-screen':'big-screen' }`}>
          {/* <div className='close-menu' onClick={()=>{setNavApperience(!navApperience)}}>
            <AiOutlineCloseCircle size={25}/>
          </div> */}
          <div className='menu-mobile' >
            <div className='menu-item' onClick={(e)=>{subCategoryHandeler('Accounts')}}>
              <p>Accounts <span className='mobile-menu-icon'> <MdKeyboardArrowRight size={15}/></span></p>
            </div>
            <Link to='/staking' className='menu-item' onClick={closeMenuHandeler} >
                <p>Staking<span className='mobile-menu-icon'> <MdKeyboardArrowRight size={15}/></span></p>
            </Link>
            <div className='menu-item' onClick={(e)=>{subCategoryHandeler('Network')}}>
              <p>Network <span className='mobile-menu-icon'> <MdKeyboardArrowRight size={15}/></span></p>
            </div>
            <div className='menu-item' onClick={(e)=>{subCategoryHandeler('Govarnance')}}>
              <p>Govarnance <span className='mobile-menu-icon'> <MdKeyboardArrowRight size={15}/></span></p>
            </div>
            <div className='menu-item' onClick={(e)=>{subCategoryHandeler('Developer')}}>
              <p>Developer<span className='mobile-menu-icon'> <MdKeyboardArrowRight size={15}/></span></p>
            </div>
            <Link to='/settings' className='menu-item' onClick={closeMenuHandeler}>Setting</Link>
            <a target='_blank' href='https://github.com/polkadot-js/apps' className='menu-item' onClick={closeMenuHandeler}>Github</a>
            <a target='_blank' href='https://wiki.polkadot.network/' className='menu-item' onClick={closeMenuHandeler}>Wiki</a>
          </div>
          <div className={` ${subCategory? 'active-sub-category':'disable-sub-category'}`} >
            {clickedSubCategory==='Accounts'&& 
            <span>
              <Link to='/accounts' className='menu-item' onClick={closeMenuHandeler} >
                <p>Accounts <span className='mobile-menu-icon'> <MdKeyboardArrowRight size={15}/></span></p>
              </Link>
              <Link to='/addresses' className='menu-item' onClick={closeMenuHandeler} >
                <p>Adress book <span className='mobile-menu-icon'> <MdKeyboardArrowRight size={15}/></span></p>
              </Link>
            </span>
             }
            {clickedSubCategory==='Network'&& 
              <span>
              <Link to='/explorer' className='menu-item' onClick={closeMenuHandeler} >
                <p>Explorer <span className='mobile-menu-icon'> <MdKeyboardArrowRight size={15}/></span></p>
              </Link>
              <Link to='/parachains' className='menu-item' onClick={closeMenuHandeler} >
                <p>Parachains <span className='mobile-menu-icon'> <MdKeyboardArrowRight size={15}/></span></p>
              </Link>
              <Link to='/calendar' className='menu-item' onClick={closeMenuHandeler}>
                <p>Event calendar <span className='mobile-menu-icon'> <MdKeyboardArrowRight size={15}/></span></p>
              </Link>
              </span>
             }
            {clickedSubCategory==='Govarnance'&&
            <span>
              <Link to='/democracy' className='menu-item' onClick={closeMenuHandeler}>
              <p>Democracy <span className='mobile-menu-icon'> <MdKeyboardArrowRight size={15}/></span></p>
            </Link>
              <Link to='/council' className='menu-item' onClick={closeMenuHandeler}>
              <p>Council <span className='mobile-menu-icon'> <MdKeyboardArrowRight size={15}/></span></p>
            </Link>
              <Link to='/treasury' className='menu-item' onClick={closeMenuHandeler}>
              <p>Treasury <span className='mobile-menu-icon'> <MdKeyboardArrowRight size={15}/></span></p>
            </Link>
              <Link to='/bounties' className='menu-item' onClick={closeMenuHandeler}>
              <p>Bounties <span className='mobile-menu-icon'> <MdKeyboardArrowRight size={15}/></span></p>
            </Link>
            </span>
             }
            {clickedSubCategory==='Developer'&& 
              <span>
              <Link to='/chainstate' className='menu-item' onClick={closeMenuHandeler}>
                <p>Chain state <span className='mobile-menu-icon'> <MdKeyboardArrowRight size={15}/></span></p>
              </Link>
              <Link to='/rpc' className='menu-item' onClick={closeMenuHandeler}>
                <p>RPC calls <span className='mobile-menu-icon'> <MdKeyboardArrowRight size={15}/></span></p>
              </Link>
              <Link to='/runtime' className='menu-item' onClick={closeMenuHandeler}>
                <p>Runtime calls <span className='mobile-menu-icon'> <MdKeyboardArrowRight size={15}/></span></p>
              </Link>
              <Link to='/js' className='menu-item' onClick={closeMenuHandeler}>
                <p>JavaScript <span className='mobile-menu-icon'> <MdKeyboardArrowRight size={15}/></span></p>
              </Link>
              <Link to='/utilities' className='menu-item' onClick={closeMenuHandeler}>
                <p>Utilities <span className='mobile-menu-icon'> <MdKeyboardArrowRight size={15}/></span></p>
              </Link>
              </span>
             }
          </div>
         </div>
        <div className={`${(navApperience||subCategory)? 'ovarlay': 'normal'}`} onClick={closeMenuHandeler}>
        </div>
      <div className='menuContainer'>
        <div className='menu-icon' onClick={()=>{setNavApperience(!navApperience)}}>
          <AiOutlineMenu size={25}/>
        </div>
        <div className='menuSection'>
          <ChainInfo />
          <ul className='menuItems'>
            {visibleGroups.map(({ name, routes }): React.ReactNode => (
              <Grouping
                isActive={activeRoute && activeRoute.group === name.toLowerCase()}
                key={name}
                name={name}
                routes={routes}
                mobile={true}
              />
            ))}
          </ul>
        </div>
        <div className='menuSection media--1200'>
          <ul className='menuItems'>
            {externalRef.current.map((route): React.ReactNode => (
              <Item
                isLink
                isToplevel
                key={route.name}
                route={route}
              />
            ))}
          </ul>
        </div>
        <NodeInfo className='media--1400' />
           <span className='accounts-mobile-screen'>
              <Link to='/accounts' className='menu-item accounts-mobile' >
                <p>Accounts</p>
              </Link>
              <Link to='/addresses' className='menu-item accounts-mobile' onClick={closeMenuHandeler} >
                <p >Adress book</p>
              </Link>
            </span>        
      </div>
    </div>
  );
}

export default React.memo(styled(Menu)`
  width: 100%;
  padding: 0;
  z-index: 220;
  position: relative;
  
  .menu-icon{
    display:none;
  }
  & .menuContainer {
    flex-direction: row;
    align-items: center;
    display: flex;
    justify-content: space-between;
    padding: 0 1.5rem;
    width: 100%;
    max-width: var(--width-full);
    margin: 0 auto;
  }

  &.isLoading {
    background: #999 !important;

    .menuActive {
      background: var(--bg-page);
    }

    &:before {
      filter: grayscale(1);
    }

    .menuItems {
      filter: grayscale(1);
    }
  }

  .menuSection {
    align-items: center;
    display: flex;
  }

  .menuActive {
    background: var(--bg-tabs);
    border-bottom: none;
    border-radius: 0.25rem 0.25rem 0 0;
    color: var(--color-text);
    padding: 1rem 1.5rem;
    margin: 0 1rem -1px;
    z-index: 1;

    .ui--Icon {
      margin-right: 0.5rem;
    }
  }

  .menuItems {
    flex: 1 1;
    list-style: none;
    margin: 0 1rem 0 0;
    padding: 0;

    > li {
      display: inline-block;
    }

    > li + li {
      margin-left: 0.375rem
    }
  }
  .ui--NodeInfo {
    align-self: center;
  }
  .big-screen{
    display:none;
  }
    .small-screen{
    display:none;
  }
  .normal{
      display: bolck;
      background: #666666;
      opacity: 0;
  }
//   .accounts-mobile-screen{
//   display: none;
// }
.accounts-mobile-screen{
   display: none; 
}
  @media only screen and (max-width: 800px) {
    .ovarlay{
      display: bolck;
      position : fixed;
      z-index: 60;
      width: 100%;
      height: 100%;
      background: #666666;
      transition : all .3s;
      opacity: .4;
      cursor: pointer;
    }
    .menuItems{
      display:none;
    }
    .close-menu{
      position: absolute;
      top: 20px;
      right: 10px;
      z-index: 70;
      cursor:pointer;
    }
    .menu-icon{
      display:inline-block;
      cursor:pointer;
    }
  .nav_section{
    width: 100%
  }
  .list_items{
    list-style: none;
    width: 100%
  }
    .big-screen{
    display:block;
    width: 100%;
    background-color: white;
    position: fixed;
    top:0;
    left:-100%;
    height:100vh;
    z-index:100;
    transition: all .3s;
  }
  
    .small-screen{
    display:block;
    width: 40%;
    background-color: white;
    position: fixed;
    top:0;
    left:0;
    height:100vh;
    z-index:100;
    transition: all .3s;
    padding-top: 30px;
  }
  .mobile-menu{
    padding: 4px;
  }
  .menu-item{
    font-weight: 500;
    padding: 10px;
    color: black;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: large;
    cursor: pointer;
    transition: all .1s;
    position: relative;
  }
  .mobile-menu-icon{
    position: absolute;
    top: 10px;
    right: 15px;
  }

  .menu-item:hover, .menu-item:active{
    background: #eaeded
  }
  .active-sub-category{
    display:block;
    width: 40%;
    background-color: white;
    position: fixed;
    top:0;
    left:0;
    height:100vh;
    z-index:101;
    transition: all .3s;
    padding-top: 30px;

  }
    .disable-sub-category{
    display:block;
    width: 100%;
    background-color: white;
    position: fixed;
    top:0;
    left:-100%;
    height:100vh;
    z-index:101;
    transition: all .3s;
    padding-top: 30px;
  }
  // .profile{
  //   display: inline-block;
  //   cursor: pointer;
  //   padding: 2px;
  // }
.accounts-mobile-screen{
  display: flex;
  align-items: center;
  justify-content: space-around;
}
.accounts-mobile > p{
  color: white;
}
.accounts-mobile:hover{
  background: #CE116E
}

  }
`);
