import QtQuick 2.15
import QtQuick.Controls 2.15

Rectangle {
    property string iconText: ""
    property string iconColor: "#ffffff"
    property string iconBgColor: "#374151"
    property string title: ""
    property string description: ""

    width: 200
    height: 160
    color: "#1f2937"
    border.color: "#374151"
    border.width: 1
    radius: 8

    Column {
        anchors.centerIn: parent
        spacing: 16
        width: parent.width - 32

        Rectangle {
            anchors.horizontalCenter: parent.horizontalCenter
            width: 48
            height: 48
            color: iconBgColor
            opacity: 0.2
            radius: 8

            Text {
                anchors.centerIn: parent
                text: iconText
                font.pixelSize: 24
                color: iconColor
            }
        }

        Column {
            anchors.horizontalCenter: parent.horizontalCenter
            spacing: 8
            width: parent.width

            Text {
                anchors.horizontalCenter: parent.horizontalCenter
                text: title
                font.pixelSize: 16
                font.bold: true
                color: "white"
                horizontalAlignment: Text.AlignHCenter
            }

            Text {
                anchors.horizontalCenter: parent.horizontalCenter
                text: description
                font.pixelSize: 12
                color: "#9ca3af"
                horizontalAlignment: Text.AlignHCenter
                wrapMode: Text.WordWrap
                width: parent.width - 16
            }
        }
    }
}
