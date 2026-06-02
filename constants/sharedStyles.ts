import { StyleSheet, Platform } from "react-native";
import { spacing, radius, typography } from "./theme";

/**
 * Shared styles used by multiple tab screens.
 * Keeps the individual screen files lean and consistent.
 */
export const sharedStyles = StyleSheet.create({
  /* Root */
  root: {
    flex: 1,
  },

  /* Top bar (.bar) */
  topBarContainer: {
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: radius.lg,
    gap: spacing.xl,
  },
  topBarIcon: {
    padding: spacing.xs,
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  filterChip: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: radius.full,
  },
  filterLabel: {
    ...typography.subtitle,
  },

  /* Body */
  body: {
    flex: 1,
    flexDirection: "row",
    padding: 24,
    paddingTop: 0,
    gap: 24,
  },

  /* .list-container */
  listContainer: {
    borderRadius: radius.xl,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.05,
        shadowRadius: 32,
      },
      android: { elevation: 2 },
    }),
  },
  fullWidthPanel: {
    flex: 1,
  },

  /* Panel header */
  panelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleText: {
    ...typography.title,
  },
  titleTextCentered: {
    ...typography.title,
    textAlign: "center",
    marginBottom: 20,
  },
  addButton: {
    marginTop: 8,
    marginBottom: 20,
  },

  /* .list-item */
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: radius.lg,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  listItemContent: {
    flex: 1,
    marginRight: spacing.sm,
  },
  subtitleText: {
    ...typography.subtitle,
    marginBottom: 2,
  },
  bodyText: {
    ...typography.body,
  },

  /* Note card right side */
  noteCardRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  datePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    marginRight: 4,
  },
  dateText: {
    ...typography.body,
    fontSize: 12,
  },

  /* Shared list contents */
  centeredListContent: {
    paddingHorizontal: spacing.md,
  },

  /* Checkbox style */
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
});
