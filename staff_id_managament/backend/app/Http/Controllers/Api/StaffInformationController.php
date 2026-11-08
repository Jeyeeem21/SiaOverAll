<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreStaffInformationRequest;
use App\Http\Requests\UpdateStaffInformationRequest;
use App\Models\StaffInformation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class StaffInformationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $staff = StaffInformation::query()
            ->with('idCard')
            ->when($request->string('search')->isNotEmpty(), function ($query) use ($request): void {
                $search = $request->string('search')->toString();
                $query->where(function ($staffQuery) use ($search): void {
                    $staffQuery->where('full_name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('department', 'like', "%{$search}%")
                        ->orWhere('position', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(12);

        return response()->json($staff);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreStaffInformationRequest $request): JsonResponse
    {
        $attributes = $request->safe()->except('photo');

        if ($request->hasFile('photo')) {
            $attributes['photo_path'] = $request->file('photo')->store('staff-photos', 'public');
        }

        $staff = StaffInformation::create($attributes);

        return response()->json($staff->load('idCard'), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(StaffInformation $staff): JsonResponse
    {
        return response()->json($staff->load(['user', 'idCards.history.changedBy', 'idCards.releases.releasedBy']));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateStaffInformationRequest $request, StaffInformation $staff): JsonResponse
    {
        $attributes = $request->safe()->except('photo');

        if ($request->hasFile('photo')) {
            $newPath = $request->file('photo')->store('staff-photos', 'public');
            if ($staff->photo_path !== null) {
                Storage::disk('public')->delete($staff->photo_path);
            }
            $attributes['photo_path'] = $newPath;
        }

        $staff->update($attributes);

        return response()->json($staff->fresh()->load('idCard'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(StaffInformation $staff): JsonResponse
    {
        if ($staff->photo_path !== null) {
            Storage::disk('public')->delete($staff->photo_path);
        }

        $staff->delete();

        return response()->json(status: 204);
    }
}
