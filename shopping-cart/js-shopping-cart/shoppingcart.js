/*
 * Copyright 2019 Lightbend Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const {ItemAdded, ItemRemoved} = entityImport('./shoppingcart.proto')

function addItem(addLineItem, cart, ctx) {
  if (addItem.quantity < 1) {
    return ctx.fail(`Cannot add negative quantity to item ${addLineItem.productId}`)
  }
  
  ctx.emit(ItemAdded({
    item: {...addItem}
  }))
}

function removeItem(removeLineItem, cart, ctx) {
  const existing = cart.items.find(item =>
    item.productId === removeItem.productId
  )

  if (!existing) {
    return ctx.fail(`Item ${removeLineItem.productId} not in cart`)
  }

  ctx.emit(ItemRemoved({
    productId: removeItem.productId
  }))
}

function itemAdded(added, cart) {
  const existing = cart.items.find(item =>
    item.productId === added.item.productId
  )

  if (existing) {
    existing.quantity = existing.quantity + added.item.quantity
  } else {
    cart.items.push(added.item)
  }

  return cart
}

export default {
  id: "com.example.shoppingcart.ShoppingCart",
  options: {
    persistenceId: "shopping-cart",
    // Usually you wouldn't snapshot this frequently, but this helps to
    // demonstrate snapshotting.
    snapshotEvery: 5, 
    includeDirs: ["./"],
    serializeFallbackToJson: true 
  },
  initial: userId => ({items: []}),
  behavior: cart => ({
    commands: {
      AddItem: addItem,
      RemoveItem: removeItem,
      GetCart: (cmd, cart, ctx) => cart
    },
    events: {
      ItemAdded: itemAdded,
      ItemRemoved: (removed, cart) => ({
        ...cart,
        items: cart.items.filter(item => item.productId !== removed.productId)})
    }
  })
}
