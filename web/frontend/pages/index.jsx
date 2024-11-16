import {
  Card,
  Page,
  Layout,
  TextContainer,
  Image,
  Stack,
  Link,
  Text,
  TextField,
  IndexTable,
  LegacyCard,
  IndexFilters,
  useSetIndexFiltersMode,
  useIndexResourceState,
  ChoiceList,
  RangeSlider,
  Badge,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useTranslation, Trans } from "react-i18next";

import IndexFiltersDefaultExample from "../components/IndexFiltersDefaultExample";


export default function HomePage() {
  const { t } = useTranslation();

  return (

    <div style={{ width: '100%', padding: '5rem'}}>
      <IndexFiltersDefaultExample />
    </div>

  );
}
