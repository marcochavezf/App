import _ from 'underscore';
import React from 'react';
import {View, Pressable} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import styles from '../../styles/styles';
import ONYXKEYS from '../../ONYXKEYS';
import themeColors from '../../styles/themes/default';
import Icon from '../../components/Icon';
import * as Expensicons from '../../components/Icon/Expensicons';
import compose from '../../libs/compose';
import * as Report from '../../libs/actions/Report';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../components/withWindowDimensions';
import MultipleAvatars from '../../components/MultipleAvatars';
import SubscriptAvatar from '../../components/SubscriptAvatar';
import DisplayNames from '../../components/DisplayNames';
import * as OptionsListUtils from '../../libs/OptionsListUtils';
import participantPropTypes from '../../components/participantPropTypes';
import VideoChatButtonAndMenu from '../../components/VideoChatButtonAndMenu';
import IOUBadge from '../../components/IOUBadge';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import CONST from '../../CONST';
import * as ReportUtils from '../../libs/ReportUtils';
import Text from '../../components/Text';
import Tooltip from '../../components/Tooltip';

const propTypes = {
    /** Toggles the navigationMenu open and closed */
    onNavigationMenuButtonClicked: PropTypes.func.isRequired,

    /* Onyx Props */

    /** The report currently being looked at */
    report: PropTypes.shape({
        /** Name of the report */
        reportName: PropTypes.string,

        /** List of primarylogins of participants of the report */
        participants: PropTypes.arrayOf(PropTypes.string),

        /** Value indicating if the report is pinned or not */
        isPinned: PropTypes.bool,
    }),

    /** The policies which the user has access to and which the report could be tied to */
    policies: PropTypes.shape({
        /** Name of the policy */
        name: PropTypes.string,
    }).isRequired,

    /** Personal details of all the users */
    personalDetails: PropTypes.objectOf(participantPropTypes),

    ...windowDimensionsPropTypes,
    ...withLocalizePropTypes,
};

const defaultProps = {
    personalDetails: {},
    report: null,
};

const HeaderView = (props) => {
    // Waiting until ONYX variables are loaded before displaying the component
    if (_.isEmpty(props.personalDetails)) {
        return null;
    }

    const participants = lodashGet(props.report, 'participants', []);
    const participantPersonalDetails = OptionsListUtils.getPersonalDetailsForLogins(participants, props.personalDetails);
    const isMultipleParticipant = participants.length > 1;
    const displayNamesWithTooltips = ReportUtils.getDisplayNamesWithTooltips(participantPersonalDetails, isMultipleParticipant);
    const isChatRoom = ReportUtils.isChatRoom(props.report);
    const isPolicyExpenseChat = ReportUtils.isPolicyExpenseChat(props.report);
    const title = ReportUtils.getReportName(props.report, participantPersonalDetails, props.policies);

    const subtitle = ReportUtils.getChatRoomSubtitle(props.report, props.policies);
    const isConcierge = participants.length === 1 && _.contains(participants, CONST.EMAIL.CONCIERGE);
    const isAutomatedExpensifyAccount = (participants.length === 1 && ReportUtils.hasExpensifyEmails(participants));

    // We hide the button when we are chatting with an automated Expensify account since it's not possible to contact
    // these users via alternative means. It is possible to request a call with Concierge so we leave the option for them.
    const shouldShowCallButton = isConcierge || !isAutomatedExpensifyAccount;
    const avatarTooltip = isChatRoom ? undefined : _.pluck(displayNamesWithTooltips, 'tooltip');
    const shouldShowSubscript = isPolicyExpenseChat && !props.report.isOwnPolicyExpenseChat && !ReportUtils.isArchivedRoom(props.report);
    const icons = ReportUtils.getIcons(props.report, props.personalDetails, props.policies);
    return (
        <View style={[styles.appContentHeader]} nativeID="drag-area">
            <View style={[styles.appContentHeaderTitle, !props.isSmallScreenWidth && styles.pl5]}>
                {props.isSmallScreenWidth && (
                    <Tooltip text={props.translate('common.back')}>
                        <Pressable
                            onPress={props.onNavigationMenuButtonClicked}
                            style={[styles.LHNToggle]}
                        >
                            <Icon src={Expensicons.BackArrow} />
                        </Pressable>
                    </Tooltip>
                )}
                {Boolean(props.report && props.report.reportName) && (
                    <View
                        style={[
                            styles.flex1,
                            styles.flexRow,
                            styles.alignItemsCenter,
                            styles.justifyContentBetween,
                        ]}
                    >
                        <Pressable
                            onPress={() => ReportUtils.navigateToDetailsPage(props.report)}
                            style={[styles.flexRow, styles.alignItemsCenter, styles.flex1]}
                        >
                            {shouldShowSubscript ? (
                                <SubscriptAvatar
                                    mainAvatar={icons[0]}
                                    secondaryAvatar={icons[1]}
                                    mainTooltip={props.report.ownerEmail}
                                    secondaryTooltip={subtitle}
                                />
                            ) : (
                                <MultipleAvatars
                                    icons={icons}
                                    avatarTooltips={avatarTooltip}
                                />
                            )}
                            <View style={[styles.flex1, styles.flexColumn]}>
                                <DisplayNames
                                    fullTitle={title}
                                    displayNamesWithTooltips={displayNamesWithTooltips}
                                    tooltipEnabled
                                    numberOfLines={1}
                                    textStyles={[styles.headerText, styles.textNoWrap]}
                                    shouldUseFullTitle={isChatRoom || isPolicyExpenseChat}
                                />
                                {(isChatRoom || isPolicyExpenseChat) && (
                                    <Text
                                        style={[
                                            styles.sidebarLinkText,
                                            styles.optionAlternateText,
                                            styles.textLabelSupporting,
                                        ]}
                                        numberOfLines={1}
                                    >
                                        {subtitle}
                                    </Text>
                                )}
                            </View>
                        </Pressable>
                        <View style={[styles.reportOptions, styles.flexRow, styles.alignItemsCenter]}>
                            {props.report.hasOutstandingIOU && (
                                <IOUBadge iouReportID={props.report.iouReportID} />
                            )}

                            {shouldShowCallButton && <VideoChatButtonAndMenu isConcierge={isConcierge} />}
                            <Tooltip text={props.report.isPinned ? props.translate('common.unPin') : props.translate('common.pin')}>
                                <Pressable
                                    onPress={() => Report.togglePinnedState(props.report)}
                                    style={[styles.touchableButtonImage, styles.mr0]}
                                >
                                    <Icon src={Expensicons.Pin} fill={props.report.isPinned ? themeColors.heading : themeColors.icon} />
                                </Pressable>
                            </Tooltip>
                        </View>
                    </View>
                )}
            </View>
        </View>
    );
};
HeaderView.propTypes = propTypes;
HeaderView.displayName = 'HeaderView';
HeaderView.defaultProps = defaultProps;

export default compose(
    withWindowDimensions,
    withLocalize,
    withOnyx({
        report: {
            key: ({reportID}) => `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
        },
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS,
        },
        policies: {
            key: ONYXKEYS.COLLECTION.POLICY,
        },
    }),
)(HeaderView);
