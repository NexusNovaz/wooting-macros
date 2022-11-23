import { VStack, HStack, useColorModeValue } from '@chakra-ui/react'
import { BaseSyntheticEvent, useCallback, useEffect, useState } from 'react'
import { useApplicationContext } from '../contexts/applicationContext'
import { useSelectedCollection, useSelectedMacro } from '../contexts/selectors'
import { KeyType, MacroType } from '../enums'
import { webCodeHIDLookup } from '../maps/HIDmap'
import { Keypress, Collection, Macro } from '../types'
import { updateBackendConfig } from '../utils'
import EditArea from '../components/macroview/EditArea'
import MacroviewHeader from '../components/macroview/Header'
import MacroTypeArea from '../components/macroview/MacroTypeArea'
import SelectElementArea from '../components/macroview/SelectElementArea'
import SequencingArea from '../components/macroview/SequencingArea'
import TriggerArea from '../components/macroview/TriggerArea'
import { useSequenceContext } from '../contexts/sequenceContext'

type Props = {
  isEditing: boolean
}

const Macroview = ({ isEditing }: Props) => {
  const { collections, selection, changeSelectedMacroIndex } = useApplicationContext()
  const {
    sequence,
    ids,
    overwriteSequence,
    overwriteIds,
    updateSelectedElementId
  } = useSequenceContext()

  const currentCollection: Collection = useSelectedCollection()
  const currentMacro: Macro = useSelectedMacro()

  const [recording, setRecording] = useState(false)
  const [macroName, setMacroName] = useState('Macro Name')
  const [triggerKeys, setTriggerKeys] = useState<Keypress[]>([])
  const [selectedMacroType, setSelectedMacroType] = useState(0)
  // need state for 'allow_while_other_keys', just a boolean

  const dividerColour = useColorModeValue('gray.400', 'gray.600')

  useEffect(() => {
    if (!isEditing) {
      return
    }
    console.log(currentMacro)
    updateSelectedElementId(-1)
    setMacroName(currentMacro.name)
    setTriggerKeys(currentMacro.trigger.data)
  }, [isEditing, updateSelectedElementId])

  const addTriggerKey = useCallback(
    (event: KeyboardEvent) => {
      event.preventDefault()

      const HIDcode = webCodeHIDLookup.get(event.code)?.HIDcode
      if (HIDcode === undefined) {
        return
      }

      if (
        triggerKeys.some((element) => {
          return HIDcode === element.keypress
        })
      ) {
        return
      }

      const keypress: Keypress = {
        keypress: HIDcode,
        press_duration: 0,
        keytype: KeyType[KeyType.Down]
      }

      setTriggerKeys((triggerKeys) => [...triggerKeys, keypress])
      if (triggerKeys.length == 3) {
        setRecording(false)
      }
    },
    [triggerKeys]
  )

  useEffect(() => {
    if (!recording) {
      return
    }
    // Does not get mouse input for trigger
    window.addEventListener('keydown', addTriggerKey, false)
    // TODO: stop backend trigger listening
    return () => {
      window.removeEventListener('keydown', addTriggerKey, false)
      // TODO: start backend trigger listening
    }
  }, [addTriggerKey, recording])

  const onRecordButtonPress = () => {
    if (!recording) {
      setTriggerKeys([])
    }
    setRecording(!recording)
  }

  const onMacroTypeButtonPress = (index: number) => {
    setSelectedMacroType(index)
  }

  const onMacroNameChange = (event: BaseSyntheticEvent) => {
    setMacroName(event.target.value)
  }

  const onSaveButtonPress = () => {
    const itemToAdd: Macro = {
      name: macroName,
      active: true,
      macro_type: MacroType[selectedMacroType],
      trigger: {
        type: 'KeyPressEvent',
        data: triggerKeys,
        allow_while_other_keys: false
      },
      sequence: ids.map((id) => sequence[id - 1])
    }

    if (isEditing) {
      currentCollection.macros[selection.macroIndex] = itemToAdd
    } else {
      currentCollection.macros.push(itemToAdd)
    }

    overwriteIds([])
    overwriteSequence([])
    updateSelectedElementId(-1)
    changeSelectedMacroIndex(-1)
    updateBackendConfig(collections)
  }

  return (
    <VStack h="100%" spacing="0px" overflow="hidden">
      {/** Header */}
      <MacroviewHeader
        triggerKeys={triggerKeys}
        macroName={isEditing ? macroName : ''}
        isEditing={isEditing}
        onMacroNameChange={onMacroNameChange}
        onSaveButtonPress={onSaveButtonPress}
      />
      <HStack w="100%" h={130} spacing="8px" p="8px">
        {/** Macro Type Area */}
        <MacroTypeArea
          selectedMacroType={selectedMacroType}
          onMacroTypeButtonPress={onMacroTypeButtonPress}
        />
        {/** Trigger Area */}
        <TriggerArea
          recording={recording}
          triggerKeys={triggerKeys}
          onRecordButtonPress={onRecordButtonPress}
        />
      </HStack>
      <HStack
        w="100%"
        h="calc(100% - 190px)"
        borderTop="1px"
        borderColor={dividerColour}
        spacing="0"
      >
        {/** Bottom Panels */}
        <SelectElementArea />
        <SequencingArea />
        <EditArea />
      </HStack>
    </VStack>
  )
}

export default Macroview
