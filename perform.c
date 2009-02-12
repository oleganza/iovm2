
IoObject *IoMessage_locals_performOn_(IoMessage *self, IoObject *locals, IoObject *target)
{
	IoState *state          = IOSTATE;
	IoMessage *m            = self;
	IoObject *result        = target;
	IoObject *cachedTarget  = target;
	IoMessageData *md;

	do
	{		
		md = DATA(m);

    // messageIsSemicolon
		if(md->name == state->semicolonSymbol)
		{
			target = cachedTarget;
		}
		else
		{
			result = md->cachedResult; // put it on the stack?
      
      // messageIsRegular
			if (!result)
			{
				IoState_pushRetainPool(state);
				result = IoObject_perform(target, locals, m);
				IoState_popRetainPoolExceptFor_(state, result);
				
				if (state->stopStatus != MESSAGE_STOP_STATUS_NORMAL)
  			{
  				return state->returnValue;
  			}	
			}
			// messageHasCachedResult
			
			target = result;
		}
	} while ((m = md->next));
  
  //messageIsNil
	return result;
}










IOVM_API IOINLINE IoObject *IoObject_activate(IoObject *self,
									 IoObject *target,
									 IoObject *locals,
									 IoMessage *m,
									 IoObject *slotContext)
{
	//TagActivateFunc *act = IoObject_tag(self)->activateFunc;
	//return act ? (IoObject *)((*act)(self, target, locals, m, slotContext)) : self;
	//printf("activate %s %i\n", IoObject_tag(self)->name, IoObject_isActivatable(self));

	return IoObject_isActivatable(self) ? (IoObject *)((IoObject_tag(self)->activateFunc)(self, target, locals, m, slotContext)) : self;
	//return IoObject_tag(self)->activateFunc ? (IoObject *)((IoObject_tag(self)->activateFunc)(self, target, locals, m, slotContext)) : self;
}

IOINLINE IO_METHOD(IoObject, forward)
{
	IoState *state = IOSTATE;
	IoObject *context;
	IoObject *forwardSlot = IoObject_rawGetSlot_context_(self, state->forwardSymbol, &context);

	/*
	if (Coro_stackSpaceAlmostGone((Coro*)IoCoroutine_cid(state->currentCoroutine)))
	{

		IoState_error_(IOSTATE, m, "stack overflow in forward while sending '%s' message to a '%s' object",
					CSTRING(IoMessage_name(m)), IoObject_name(self));
	}
	*/

	if (forwardSlot)
	{
		return IoObject_activate(forwardSlot, self, locals, m, context);
	}

	IoState_error_(state, m, "'%s' does not respond to message '%s'",
				IoObject_name(self), CSTRING(IoMessage_name(m)));
	return self;
}

IOINLINE IO_METHOD(IoObject, perform)
{
	IoObject *context;
	IoObject *slotValue = IoObject_rawGetSlot_context_(self, IoMessage_name(m), &context);

	if (slotValue)
	{
		return IoObject_activate(slotValue, self, locals, m, context);
	}

	if (IoObject_isLocals(self))
	{
		return IoObject_localsForward(self, locals, m);
	}

	return IoObject_forward(self, locals, m);
}





IoObject *IoBlock_activate(IoBlock *self, IoObject *target, IoObject *locals, IoMessage *m, IoObject *slotContext)
{
	IoState *state = IOSTATE;
	intptr_t poolMark; // = IoState_pushRetainPool(state);

	IoBlockData *selfData = DATA(self);
	List *argNames  = selfData->argNames;
	IoObject *scope = selfData->scope;

	IoObject *blockLocals = IOCLONE(state->localsProto);
	IoObject *result;
	IoObject *callObject;

	IoObject_isLocals_(blockLocals, 1);

	if (!scope)
	{
		scope = target;
	}

	IoObject_createSlotsIfNeeded(blockLocals);

	callObject = IoCall_with(state,
							 locals,
							 target,
							 m,
							 slotContext,
							 self,
							 state->currentCoroutine);

	{
		PHash *bslots = IoObject_slots(blockLocals);
		PHash_at_put_(bslots, state->callSymbol, callObject);
		PHash_at_put_(bslots, state->selfSymbol, scope);
		PHash_at_put_(bslots, state->updateSlotSymbol, state->localsUpdateSlotCFunc);
	}

	IoObject_isReferenced_(blockLocals, 0);
	IoObject_isReferenced_(callObject, 0);

	poolMark = IoState_pushRetainPool(state);

	LIST_FOREACH(argNames, i, name,
		IoObject *arg = IoMessage_locals_valueArgAt_(m, locals, i);
		// gc may kick in while evaling locals, so we need to be safe
		IoObject_setSlot_to_(blockLocals, name, arg);
	);

	if (Coro_stackSpaceAlmostGone(IoCoroutine_cid(state->currentCoroutine)))
	{
		IoCoroutine *newCoro = IoCoroutine_new(state);
		IoCoroutine_try(newCoro, blockLocals, blockLocals, selfData->message);
		result = IoCoroutine_rawResult(newCoro);
	}
	else
	{
		result = IoMessage_locals_performOn_(selfData->message, blockLocals, blockLocals);
	}
  // OA: should not be in the core
  //
  // doc Block passStops
  //  Returns whether or not the receiver passes return/continue/break to caller.
  // ------
  // doc Block setPassStops(aBool)
  //  Sets whether the receiver passes return/continue/break to caller.
  
	if (DATA(self)->passStops == 0)
	{
		state->returnValue = result;
		state->stopStatus = IoCall_rawStopStatus(callObject);
	}
	
	IoState_popRetainPool_(state, poolMark);
	
	IoState_stackRetain_(state, result);
	return result;
}



