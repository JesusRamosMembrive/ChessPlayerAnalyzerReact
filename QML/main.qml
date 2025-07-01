import QtQuick 2.15
import QtQuick.Window 2.15
import QtQuick.Controls 2.15
import QtQuick.Layouts 1.15

ApplicationWindow {
    id: window
    width: 1200
    height: 800
    visible: true
    title: "Chess Analyzer"
    color: "#000000"

    ScrollView {
        anchors.fill: parent
        contentWidth: window.width
        contentHeight: mainContent.height

        Rectangle {
            id: mainContent
            width: parent.width
            height: childrenRect.height
            color: "#000000"

            Column {
                width: parent.width
                spacing: 0

                // Header
                Rectangle {
                    width: parent.width
                    height: 72
                    color: "#000000"
                    border.color: "#1f2937"
                    border.width: 1

                    Rectangle {
                        anchors.fill: parent
                        color: "transparent"

                        Row {
                            anchors.left: parent.left
                            anchors.leftMargin: 24
                            anchors.verticalCenter: parent.verticalCenter
                            spacing: 12

                            Rectangle {
                                width: 32
                                height: 32
                                color: "#16a34a"
                                radius: 8

                                Text {
                                    anchors.centerIn: parent
                                    text: "📈"
                                    font.pixelSize: 20
                                    color: "white"
                                }
                            }

                            Text {
                                anchors.verticalCenter: parent.verticalCenter
                                text: "Chess Analyzer"
                                font.pixelSize: 20
                                font.bold: true
                                color: "white"
                            }
                        }
                    }
                }

                // Main Content Area
                Rectangle {
                    width: parent.width
                    height: childrenRect.height + 96
                    color: "#000000"

                    Column {
                        anchors.horizontalCenter: parent.horizontalCenter
                        anchors.top: parent.top
                        anchors.topMargin: 48
                        width: Math.min(896, parent.width - 48)
                        spacing: 48

                        // Main Analysis Section
                        Column {
                            width: parent.width
                            spacing: 32

                            Column {
                                anchors.horizontalCenter: parent.horizontalCenter
                                spacing: 16

                                Text {
                                    anchors.horizontalCenter: parent.horizontalCenter
                                    text: "Analyze Chess Performance"
                                    font.pixelSize: 36
                                    font.bold: true
                                    color: "white"
                                }

                                Text {
                                    anchors.horizontalCenter: parent.horizontalCenter
                                    text: "Discover patterns, detect anomalies, and gain insights from chess.com game data"
                                    font.pixelSize: 18
                                    color: "#9ca3af"
                                    horizontalAlignment: Text.AlignHCenter
                                    wrapMode: Text.WordWrap
                                    width: Math.min(600, parent.width)
                                }
                            }

                            // Analysis Card
                            Rectangle {
                                anchors.horizontalCenter: parent.horizontalCenter
                                width: Math.min(384, parent.width)
                                height: childrenRect.height
                                color: "#1f2937"
                                border.color: "#374151"
                                border.width: 1
                                radius: 8

                                Column {
                                    width: parent.width
                                    spacing: 0

                                    // Card Header
                                    Rectangle {
                                        width: parent.width
                                        height: childrenRect.height + 32
                                        color: "transparent"

                                        Column {
                                            anchors.left: parent.left
                                            anchors.right: parent.right
                                            anchors.top: parent.top
                                            anchors.margins: 24
                                            spacing: 8

                                            Row {
                                                spacing: 8

                                                Text {
                                                    text: "🔍"
                                                    font.pixelSize: 20
                                                    color: "white"
                                                }

                                                Text {
                                                    text: "New Analysis"
                                                    font.pixelSize: 18
                                                    font.bold: true
                                                    color: "white"
                                                }
                                            }

                                            Text {
                                                text: "Enter a chess.com username to analyze"
                                                font.pixelSize: 14
                                                color: "white"
                                            }
                                        }
                                    }

                                    // Card Content
                                    Rectangle {
                                        width: parent.width
                                        height: childrenRect.height + 32
                                        color: "transparent"

                                        Column {
                                            anchors.left: parent.left
                                            anchors.right: parent.right
                                            anchors.top: parent.top
                                            anchors.margins: 24
                                            spacing: 16

                                            Rectangle {
                                                width: parent.width
                                                height: 40
                                                color: "#374151"
                                                border.color: "#4b5563"
                                                border.width: 1
                                                radius: 6

                                                TextInput {
                                                    anchors.left: parent.left
                                                    anchors.right: parent.right
                                                    anchors.verticalCenter: parent.verticalCenter
                                                    anchors.margins: 12
                                                    font.pixelSize: 14
                                                    color: "white"
                                                    selectByMouse: true

                                                    Text {
                                                        anchors.left: parent.left
                                                        anchors.verticalCenter: parent.verticalCenter
                                                        text: "Enter chess.com username"
                                                        font.pixelSize: 14
                                                        color: "#9ca3af"
                                                        visible: parent.text.length === 0
                                                    }
                                                }
                                            }

                                            Rectangle {
                                                width: parent.width
                                                height: 40
                                                color: "#16a34a"
                                                radius: 6

                                                MouseArea {
                                                    anchors.fill: parent
                                                    hoverEnabled: true
                                                    onEntered: parent.color = "#15803d"
                                                    onExited: parent.color = "#16a34a"
                                                }

                                                Text {
                                                    anchors.centerIn: parent
                                                    text: "Start Analysis"
                                                    font.pixelSize: 14
                                                    font.bold: true
                                                    color: "white"
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        // Features Grid
                        Grid {
                            anchors.horizontalCenter: parent.horizontalCenter
                            columns: 4
                            columnSpacing: 24
                            rowSpacing: 24
                            width: parent.width

                            // Opening Entropy Card
                            FeatureCard {
                                iconText: "📊"
                                iconColor: "#1e40af"
                                iconBgColor: "#1e3a8a"
                                title: "Opening Entropy"
                                description: "Analyze opening diversity vs ELO consistency"
                            }

                            // Move Timing Card
                            FeatureCard {
                                iconText: "⏰"
                                iconColor: "#7c3aed"
                                iconBgColor: "#5b21b6"
                                title: "Move Timing"
                                description: "Detect suspicious timing patterns"
                            }

                            // Win/Loss Stats Card
                            FeatureCard {
                                iconText: "📈"
                                iconColor: "#16a34a"
                                iconBgColor: "#15803d"
                                title: "Win/Loss Stats"
                                description: "Comprehensive game outcome analysis"
                            }

                            // Comeback Analysis Card
                            FeatureCard {
                                iconText: "⚡"
                                iconColor: "#ea580c"
                                iconBgColor: "#c2410c"
                                title: "Comeback Analysis"
                                description: "Identify dramatic game turnarounds"
                            }
                        }

                        // Analyzed Players Section
                        Rectangle {
                            width: parent.width
                            height: childrenRect.height
                            color: "#1f2937"
                            border.color: "#374151"
                            border.width: 1
                            radius: 8

                            Column {
                                width: parent.width
                                spacing: 0

                                // Header
                                Rectangle {
                                    width: parent.width
                                    height: childrenRect.height + 32
                                    color: "transparent"

                                    Row {
                                        anchors.left: parent.left
                                        anchors.top: parent.top
                                        anchors.margins: 24
                                        spacing: 8

                                        Text {
                                            text: "👥"
                                            font.pixelSize: 20
                                            color: "white"
                                        }

                                        Text {
                                            text: "Analyzed Players"
                                            font.pixelSize: 18
                                            font.bold: true
                                            color: "white"
                                        }
                                    }
                                }

                                // Loading Skeleton
                                Rectangle {
                                    width: parent.width
                                    height: childrenRect.height + 32
                                    color: "transparent"

                                    Column {
                                        anchors.left: parent.left
                                        anchors.right: parent.right
                                        anchors.top: parent.top
                                        anchors.margins: 24
                                        spacing: 12

                                        Repeater {
                                            model: 3
                                            Rectangle {
                                                width: parent.width
                                                height: 64
                                                color: "#374151"
                                                opacity: 0.5
                                                radius: 8

                                                SequentialAnimation on opacity {
                                                    running: true
                                                    loops: Animation.Infinite
                                                    NumberAnimation { to: 0.3; duration: 1000 }
                                                    NumberAnimation { to: 0.5; duration: 1000 }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
