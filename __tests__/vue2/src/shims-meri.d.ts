declare module 'meri-design/dist/Button' {
    import Vue from 'vue'
    export default Vue
}
declare module 'meri-design/dist/TableGrid' {
    import Vue from 'vue'
    export default Vue
}

declare module 'meri-design' {
    import { VueConstructor } from 'vue'
    export const install: any
    export const Avatar: VueConstructor
    export const Badge: VueConstructor
    export const Breadcrumb: VueConstructor
    export const Button: VueConstructor
    export const CarouselText: VueConstructor
    export const Cascader: VueConstructor
    export const CascaderSearchList: VueConstructor
    export const Checkbox: VueConstructor
    export const CheckboxGroup: VueConstructor
    export const CustomTreeSelectEnergy: VueConstructor
    export const DateDrop: VueConstructor
    export const Divider: VueConstructor
    export const Drawer: VueConstructor
    export const DropDownButton: VueConstructor
    export const DropGroup: VueConstructor
    export const DropGroupFrame: VueConstructor
    export const Dropdown: VueConstructor
    export const Editable: VueConstructor
    export const EditableList: VueConstructor
    export const EmptyStatus: VueConstructor
    export const FileUpload: VueConstructor
    export const FrameMenu: VueConstructor
    export const Headers: VueConstructor
    export const Icon: VueConstructor
    export const ImageUpload: VueConstructor
    export const ImgView: VueConstructor
    export const IndexLoading: VueConstructor
    export const Input: VueConstructor
    export const InputNumber: VueConstructor
    export const Loading: VueConstructor
    export const LottieAnimation: VueConstructor
    export const MButton: VueConstructor
    export const MCascade: VueConstructor
    export const MInput: VueConstructor
    export const MSelect: VueConstructor
    export const MTab: VueConstructor
    export type IMessageFunction = (query: { type: 'success' | 'error' | 'warning'; message: string }) => void
    export const Message: VueConstructor | IMessageFunction
    export const Modal: VueConstructor
    export const ModalConfirm: VueConstructor
    export const MultipleSearchInput: VueConstructor
    export const PTree: VueConstructor
    export const PTreeSelect: VueConstructor
    export const Pagination: VueConstructor
    export const PickerDate: VueConstructor
    export const PickerMonth: VueConstructor
    export const PickerMonthDay: VueConstructor
    export const PickerTime: VueConstructor
    export const PickerTime2400: VueConstructor
    export const PopConfirm: VueConstructor
    export const PopContainer: VueConstructor
    export const PopTip: VueConstructor
    export const Popover: VueConstructor
    export const PopoverTip: VueConstructor
    export const Radio: VueConstructor
    export const RadioGroup: VueConstructor
    export const Select: VueConstructor
    export const SelectAndInput: VueConstructor
    export const SelectScreen: VueConstructor
    export const Shake: VueConstructor
    export const SidebarCustom: VueConstructor
    export const THead: VueConstructor
    export const Table: VueConstructor
    export const TableGrid: VueConstructor
    export const TableTree: VueConstructor
    export const Tabs: VueConstructor
    export const Tabulation: VueConstructor
    export const Tag: VueConstructor
    export const TimeDrop: VueConstructor
    export const Toggle: VueConstructor
    export const Tooltip: VueConstructor
    export const TopNotification: VueConstructor
    export const Transfer: VueConstructor
    export const TransferEquipment: VueConstructor
    export const TransferMini: VueConstructor
    export const TransferSelectModal: VueConstructor
    export const TransferTab: VueConstructor
    export const Tree: VueConstructor
    export const TreeBi: VueConstructor
    export const TreePersonOrg: VueConstructor
    export const TreeSelect: VueConstructor
    export const TreeStage: VueConstructor
    export const ViewTable: VueConstructor
}
